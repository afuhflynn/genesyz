import {
  type GenerateObjectResult,
  type GenerateTextResult,
  generateObject,
  generateText,
} from "ai";
import { getModels } from "./models";

const { primaryModel, secondaryModel, tertiaryModel } = getModels();

interface FallbackOptions {
  schema: any;
  system?: string;
  prompt: string;
}

/**
 * Safely parse JSON with multiple fallback strategies
 */
async function safeJsonParse(
  text: string,
  schema: any,
  maxRetries = 2,
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try direct parse first
      let parsed = JSON.parse(text);

      // If schema provided, validate and transform
      if (schema) {
        const result = schema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
        // Try to extract JSON from text if it contains markdown
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
    } catch (e) {
      // Try to extract JSON from various formats
      const patterns = [
        /\{[\s\S]*\}/, // Any JSON object
        /\[[\s\S]*\]/, // Any JSON array
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
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

      // Last attempt: try to fix common issues
      try {
        const fixed = text
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/';/g, '";')
          .replace(/'/g, '"');
        const parsed = JSON.parse(fixed);
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

/**
 * Generates an object using a triple-model fallback strategy with graceful error handling.
 * Also falls back to generateText + JSON parsing if schema is too complex.
 */
export async function generateObjectWithFallback<T>(
  options: FallbackOptions,
  agentName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  const { schema, system, prompt } = options;

  // Strategy 1: Try generateObject with primary model
  try {
    const result = await generateObject({
      schema,
      system,
      prompt,
      model: primaryModel,
    });
    return { result: result as GenerateObjectResult<T>, modelUsed: "gpt-4o" };
  } catch (primaryError: any) {
    console.warn(
      `[${agentName}] Primary model failed:`,
      primaryError?.message || primaryError,
    );

    // Check if it's a schema complexity error
    const isSchemaError =
      primaryError?.message?.includes("too many states") ||
      primaryError?.message?.includes("constraint");

    if (isSchemaError) {
      console.warn(
        `[${agentName}] Schema too complex, falling back to generateText`,
      );
      return generateTextFallbackWithSchema<T>(
        schema,
        system,
        prompt,
        agentName,
      );
    }

    // Strategy 2: Try generateObject with secondary model
    try {
      const result = await generateObject({
        schema,
        system,
        prompt,
        model: secondaryModel,
      });
      return {
        result: result as GenerateObjectResult<T>,
        modelUsed: "open-mixtral-8x7b",
      };
    } catch (secondaryError: any) {
      console.warn(
        `[${agentName}] Secondary model failed, trying tertiary:`,
        secondaryError?.message || secondaryError,
      );

      // Check schema error again
      const isSchemaError =
        secondaryError?.message?.includes("too many states") ||
        secondaryError?.message?.includes("constraint");

      if (isSchemaError) {
        return generateTextFallbackWithSchema<T>(
          schema,
          system,
          prompt,
          agentName,
        );
      }

      // Strategy 3: Try generateObject with tertiary model
      try {
        const result = await generateObject({
          schema,
          system,
          prompt,
          model: tertiaryModel,
        });
        return {
          result: result as GenerateObjectResult<T>,
          modelUsed: "gemini-2.5-flash",
        };
      } catch (tertiaryError: any) {
        console.warn(
          `[${agentName}] All models failed, trying text fallback:`,
          tertiaryError?.message || tertiaryError,
        );

        return generateTextFallbackWithSchema<T>(
          schema,
          system,
          prompt,
          agentName,
        );
      }
    }
  }
}

/**
 * Fallback to generateText when schemas are too complex
 */
async function generateTextFallbackWithSchema<T>(
  schema: any,
  system: string | undefined,
  prompt: string,
  agentName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  const models = [primaryModel, secondaryModel, tertiaryModel];
  const modelNames = ["gpt-4o", "open-mixtral-8x7b", "gemini-2.5-flash"];

  for (let i = 0; i < models.length; i++) {
    try {
      const textResult = await generateText({
        system: `${system}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanations.`,
        prompt: `${prompt}\n\nRespond as a JSON object matching this schema: ${JSON.stringify(schema.describe ? schema.describe() : {}).slice(0, 500)}...`,
        model: models[i],
      });

      const text = textResult.text;
      const parsed = await safeJsonParse(text, schema);

      console.log(
        `[${agentName}] Successfully parsed using ${modelNames[i]} with text fallback`,
      );

      // Create a mock result that matches the expected return type
      return {
        result: {
          object: parsed,
          usage: textResult.usage,
          finishReason: textResult.finishReason,
        } as GenerateObjectResult<T>,
        modelUsed: `${modelNames[i]}-text-fallback`,
      };
    } catch (error: any) {
      console.warn(
        `[${agentName}] Text fallback attempt ${i + 1} failed:`,
        error?.message || error,
      );
    }
  }

  // Last resort: return a minimal valid object based on schema
  console.error(
    `[${agentName}] All fallback strategies failed, returning minimal response`,
  );
  throw new Error(`All AI generation strategies failed for ${agentName}`);
}

/**
 * Generates text using a triple-model fallback strategy.
 */
export async function generateTextWithFallback(
  options: any,
  agentName: string,
): Promise<{ result: GenerateTextResult<any, any>; modelUsed: string }> {
  const models = [primaryModel, secondaryModel, tertiaryModel];
  const modelNames = ["gpt-4o", "open-mixtral-8x7b", "gemini-2.5-flash"];

  for (let i = 0; i < models.length; i++) {
    try {
      const result = await generateText({
        ...options,
        model: models[i],
      });
      return { result, modelUsed: modelNames[i] };
    } catch (error: any) {
      console.warn(
        `[${agentName}] Model ${modelNames[i]} failed:`,
        error?.message || error,
      );
    }
  }

  throw new Error(`All AI text generation strategies failed for ${agentName}`);
}
