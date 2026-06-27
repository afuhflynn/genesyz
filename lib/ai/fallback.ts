import {
  type GenerateObjectResult,
  type GenerateTextResult,
  generateObject,
  generateText,
  type LanguageModel,
} from "ai";
import { model as geminiModel } from "./models";
import { z } from "zod";

const model: LanguageModel = geminiModel;

interface FallbackOptions {
  schema: z.ZodTypeAny;
  system?: string;
  prompt: string;
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
      const patterns = [
        /\{[\s\S]*\}/,
        /\[[\s\S]*\]/,
      ];

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

  try {
    const result = await generateObject({
      schema,
      system,
      prompt,
      model,
    });
    return { result: result as GenerateObjectResult<T>, modelUsed: "gemini-2.5-flash" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[${agentName}] generateObject failed:`, message);

    const isSchemaError =
      message.includes("too many states") ||
      message.includes("constraint");

    if (isSchemaError) {
      console.warn(`[${agentName}] Schema too complex, falling back to generateText`);
      return generateTextFallbackWithSchema<T>(schema, system, prompt, agentName);
    }

    throw error;
  }
}

async function generateTextFallbackWithSchema<T>(
  schema: z.ZodTypeAny,
  system: string | undefined,
  prompt: string,
  agentName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  for (let i = 0; i < 2; i++) {
    try {
      const textResult = await generateText({
        system: `${system}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanations.`,
        prompt: `${prompt}\n\nRespond as a JSON object matching this schema: ${JSON.stringify(schema.description ? { type: (schema._def as { typeName?: string }).typeName } : {}).slice(0, 500)}...`,
        model,
      });

      const text = textResult.text;
      const parsed = await safeJsonParse(text, schema);

      console.log(`[${agentName}] Successfully parsed using gemini-2.5-flash with text fallback`);

      return {
        result: {
          object: parsed,
          usage: textResult.usage,
          finishReason: textResult.finishReason,
        } as GenerateObjectResult<T>,
        modelUsed: "gemini-2.5-flash-text-fallback",
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[${agentName}] Text fallback attempt ${i + 1} failed:`, message);
    }
  }

  throw new Error(`All AI generation strategies failed for ${agentName}`);
}

export async function generateTextWithFallback(
  options: Record<string, unknown>,
  agentName: string,
): Promise<{ result: GenerateTextResult<any, any>; modelUsed: string }> {
  try {
    const result = await generateText({
      ...options,
      model,
    } as any);
    return { result, modelUsed: "gemini-2.5-flash" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[${agentName}] Gemini generation failed:`, message);
    throw error;
  }
}
