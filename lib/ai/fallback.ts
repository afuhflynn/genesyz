import {
  type GenerateObjectResult,
  type GenerateTextResult,
  generateObject,
  generateText,
} from "ai";
import type { z } from "zod";
import { modelChain } from "./models";

const MODEL_TIMEOUT_MS = 45000;

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
    } catch {
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
        instructions: system,
        prompt,
        model: entry.model as any,
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
        message.includes("too many states") || message.includes("constraint");

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

async function generateTextFallbackWithSchema<T>(
  schema: z.ZodTypeAny,
  instructions: string | undefined,
  prompt: string,
  agentName: string,
  model: any,
  modelName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  for (let i = 0; i < 2; i++) {
    try {
      const textResult = await generateText({
        instructions: `${instructions}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanations.`,
        prompt: `${prompt}\n\nRespond as a JSON object matching this schema: ${JSON.stringify(schema.description ? { type: (schema._def as { typeName?: string }).typeName } : {}).slice(0, 500)}...`,
        model,
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
  options: Record<string, unknown>,
  agentName: string,
): Promise<{
  result: GenerateTextResult<any, any, any>;
  modelUsed: string;
}> {
  const errors: string[] = [];

  for (const entry of modelChain) {
    try {
      const result = await generateText({
        ...options,
        model: entry.model as any,
        abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      } as any);
      return { result: result as any, modelUsed: entry.name };
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
