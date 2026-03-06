import {
  generateObject,
  generateText,
  type GenerateObjectResult,
  type GenerateTextResult,
} from "ai";
import { getModels } from "./models";

const { primaryModel, secondaryModel, tertiaryModel } = getModels();

/**
 * Generates an object using a triple-model fallback strategy.
 * OpenAI -> Mistral -> Google
 */
export async function generateObjectWithFallback<T>(
  options: any, // Using any for options to avoid complex AI SDK union mismatches
  agentName: string,
): Promise<{ result: GenerateObjectResult<T>; modelUsed: string }> {
  try {
    const result = await generateObject({
      ...options,
      model: primaryModel,
    });
    return { result: result as GenerateObjectResult<T>, modelUsed: "gpt-5.2" };
  } catch (primaryError) {
    console.warn(
      `[${agentName}] OpenAI primary model failed, falling back to Mistral:`,
      primaryError,
    );
    try {
      const result = await generateObject({
        ...options,
        model: secondaryModel,
      });
      return {
        result: result as GenerateObjectResult<T>,
        modelUsed: "open-mixtral-8x7b",
      };
    } catch (secondaryError) {
      console.warn(
        `[${agentName}] Mistral secondary model failed, falling back to Gemini:`,
        secondaryError,
      );
      const result = await generateObject({
        ...options,
        model: tertiaryModel,
      });
      return {
        result: result as GenerateObjectResult<T>,
        modelUsed: "gemini-2.5-flash",
      };
    }
  }
}

/**
 * Generates text using a triple-model fallback strategy.
 * OpenAI -> Mistral -> Google
 */
export async function generateTextWithFallback(
  options: any,
  agentName: string,
): Promise<{ result: GenerateTextResult<any, any>; modelUsed: string }> {
  try {
    const result = await generateText({
      ...options,
      model: primaryModel,
    });
    return { result, modelUsed: "gpt-4o" };
  } catch (primaryError) {
    console.warn(
      `[${agentName}] OpenAI primary model failed, falling back to Mistral:`,
      primaryError,
    );
    try {
      const result = await generateText({
        ...options,
        model: secondaryModel,
      });
      return { result, modelUsed: "open-mixtral-8x7b" };
    } catch (secondaryError) {
      console.warn(
        `[${agentName}] Mistral secondary model failed, falling back to Gemini:`,
        secondaryError,
      );
      const result = await generateText({
        ...options,
        model: tertiaryModel,
      });
      return { result, modelUsed: "gemini-2.5-flash" };
    }
  }
}
