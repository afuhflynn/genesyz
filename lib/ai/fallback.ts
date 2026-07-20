import {
  type GenerateObjectResult,
  type GenerateTextResult,
  type LanguageModel,
  generateObject,
  generateText,
} from "ai";
import type { z } from "zod";
import { modelChain } from "./models";

const MODEL_TIMEOUT_MS = 90000;

interface FallbackOptions {
  schema: z.ZodTypeAny;
  system?: string;
  prompt: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("retry in")
  );
}

function extractRetryDelay(message: string): number | null {
  const match = message.match(/retry in (\d+\.?\d*)\s*s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 1000;
  }
  return null;
}

function repairTruncatedJson(text: string): string {
  let cleanText = text.trim();
  
  const firstBrace = cleanText.indexOf('{');
  const firstBracket = cleanText.indexOf('[');
  let startIdx = 0;
  
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }
  
  cleanText = cleanText.substring(startIdx);

  let inString = false;
  let escaped = false;
  const stack: ("{" | "[")[] = [];

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        stack.push('{');
      } else if (char === '[') {
        stack.push('[');
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  let repaired = cleanText;
  
  if (inString) {
    repaired += '"';
  }

  repaired = repaired.trim();
  while (repaired.endsWith(',') || repaired.endsWith(':')) {
    repaired = repaired.substring(0, repaired.length - 1).trim();
  }

  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') {
      repaired += '}';
    } else if (last === '[') {
      repaired += ']';
    }
  }

  return repaired;
}

async function safeJsonParse(
  text: string,
  schema: z.ZodTypeAny,
  maxRetries = 2,
): Promise<unknown> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let parsed: unknown = JSON.parse(text);

      if (schema) {
        const result = schema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
          const retryResult = schema.safeParse(parsed);
          if (retryResult.success) {
            return retryResult.data;
          }
        }
      }
      return parsed;
    } catch (error: any) {
      console.warn("JSON.parse primary attempt failed:", error?.message || String(error));

      try {
        const repaired = repairTruncatedJson(text);
        const parsed = JSON.parse(repaired);
        if (schema) {
          const result = schema.safeParse(parsed);
          if (result.success) {
            return result.data;
          }
        }
        return parsed;
      } catch (repairErr: any) {
        console.warn("JSON repair attempt failed:", repairErr.message);
      }

      const patterns = [/\{[\s\S]*\}/, /\[[\s\S]*\]]/];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          try {
            const parsed: unknown = JSON.parse(match[0]);
            if (schema) {
              const result = schema.safeParse(parsed);
              if (result.success) {
                return result.data;
              }
            }
            return parsed;
          } catch {}
        }
      }

      try {
        const fixed = text
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/';/g, '";')
          .replace(/'/g, '"');
        const parsed: unknown = JSON.parse(fixed);
        if (schema) {
          const result = schema.safeParse(parsed);
          if (result.success) {
            return result.data;
          }
        }
        return parsed;
      } catch {}
    }
  }
  console.warn("safeJsonParse failed to parse text:", text);
  throw new Error("Failed to parse JSON after multiple attempts");
}

export async function generateObjectWithFallback<T>(
  options: FallbackOptions,
  agentName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  const { schema, system, prompt } = options;
  const errors: string[] = [];

  for (const entry of modelChain) {
    try {
      const result = await generateObject({
        schema,
        system,
        instructions: system,
        prompt,
        model: entry.model,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
      return {
        result: result as unknown as GenerateObjectResult<T>,
        modelUsed: entry.name,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[${agentName}] ${entry.name} failed:`, message);

      if (isQuotaError(message)) {
        const delay = extractRetryDelay(message) ?? 10000;
        console.warn(
          `[${agentName}] ${entry.name} quota hit, waiting ${delay}ms before next model...`,
        );
        await sleep(delay);
        errors.push(`${entry.name}: ${message} (backoff ${delay}ms)`);
        continue;
      }

      errors.push(`${entry.name}: ${message}`);

      const isSchemaError =
        message.includes("too many states") ||
        message.includes("constraint") ||
        message.includes("schema") ||
        message.includes("match") ||
        message.includes("object generated") ||
        message.includes("JSON");

      if (isSchemaError) {
        try {
          return await generateTextFallbackWithSchema<T>(
            schema,
            system,
            prompt,
            agentName,
            entry.model,
            entry.name,
          );
        } catch (fbError: unknown) {
          const fbMessage =
            fbError instanceof Error ? fbError.message : String(fbError);
          console.warn(
            `[${agentName}] Text fallback on ${entry.name} also failed:`,
            fbMessage,
          );
          errors.push(`${entry.name}-text-fallback: ${fbMessage}`);
        }
      }
    }
  }

  throw new Error(
    `All models failed for ${agentName}. Errors: ${errors.join(" | ")}`,
  );
}

function describeSchema(schema: any): any {
  if (!schema) return "any";
  if (schema._def?.typeName === "ZodObject") {
    const shape = schema.shape;
    const desc: Record<string, any> = {};
    for (const key in shape) {
      desc[key] = describeSchema(shape[key]);
    }
    return desc;
  }
  if (schema._def?.typeName === "ZodArray") {
    return [describeSchema(schema._def.type)];
  }
  if (schema._def?.typeName === "ZodString") {
    return "string";
  }
  if (schema._def?.typeName === "ZodNumber") {
    return "number";
  }
  if (schema._def?.typeName === "ZodBoolean") {
    return "boolean";
  }
  if (schema._def?.typeName === "ZodEnum") {
    return schema._def.values.join(" | ");
  }
  if (schema._def?.typeName === "ZodOptional" || schema._def?.typeName === "ZodNullable") {
    return `${describeSchema(schema._def.innerType)} (optional)`;
  }
  return "string";
}

async function generateTextFallbackWithSchema<T>(
  schema: z.ZodTypeAny,
  instructions: string | undefined,
  prompt: string,
  agentName: string,
  model: LanguageModel,
  modelName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  for (let i = 0; i < 2; i++) {
    try {
      const textResult = await generateText({
        system: `${instructions}\n\nIMPORTANT: Respond with valid JSON only. No markdown formatting (no \`\`\`json blocks), no explanation or commentary. Only the raw JSON string.`,
        prompt: `${prompt}\n\nRespond as a JSON object matching this schema structure:\n${JSON.stringify(describeSchema(schema), null, 2)}`,
        model,
        maxOutputTokens: 4000,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });

      const text = textResult.text;
      const parsed = await safeJsonParse(text, schema);

      console.log(
        `[${agentName}] Successfully parsed using ${modelName} with text fallback`,
      );

      return {
        result: {
          object: parsed,
          usage: textResult.usage,
          finishReason: textResult.finishReason,
        } as unknown as GenerateObjectResult<T>,
        modelUsed: `${modelName}-text-fallback`,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      if (i === 0 && isQuotaError(message)) {
        const delay = extractRetryDelay(message) ?? 10000;
        console.warn(
          `[${agentName}] Text fallback on ${modelName} quota hit, waiting ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      console.warn(
        `[${agentName}] Text fallback attempt ${i + 1} on ${modelName} failed:`,
        message,
      );
    }
  }

  throw new Error(`Text fallback failed for ${agentName} on ${modelName}`);
}

export async function generateTextWithFallback(
  options: Omit<Parameters<typeof generateText>[0], "model">,
  agentName: string,
): Promise<{
  result: GenerateTextResult<any, any, any>;
  modelUsed: string;
}> {
  const errors: string[] = [];

  for (const entry of modelChain) {
    try {
      const result = await generateText({
        maxOutputTokens: 4000,
        ...options,
        model: entry.model,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      } as Parameters<typeof generateText>[0]);
      return { result, modelUsed: entry.name };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[${agentName}] ${entry.name} failed:`, message);

      if (isQuotaError(message)) {
        const delay = extractRetryDelay(message) ?? 10000;
        console.warn(
          `[${agentName}] ${entry.name} quota hit, waiting ${delay}ms before next model...`,
        );
        await sleep(delay);
        errors.push(`${entry.name}: ${message} (backoff ${delay}ms)`);
        continue;
      }

      errors.push(`${entry.name}: ${message}`);
    }
  }

  throw new Error(
    `All models failed for ${agentName}. Errors: ${errors.join(" | ")}`,
  );
}
