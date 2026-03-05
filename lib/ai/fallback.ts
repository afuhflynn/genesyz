import {
  generateObject,
  generateText,
} from "ai";
import { getModels } from "./models";

const { primaryModel, secondaryModel, tertiaryModel } = getModels();

type GenerateObjectOptions = Parameters<typeof generateObject>[0];
type GenerateTextOptions = Parameters<typeof generateText>[0];

/**
 * Generates an object using a triple-model fallback strategy.
 * OpenAI -> Mistral -> Google
 */
export async function generateObjectWithFallback<T>(
  options: Omit<GenerateObjectOptions, "model">,
  agentName: string,
) {
  try {
    const result = await generateObject({
      ...(options as any),
      model: primaryModel,
    });
    return { result, modelUsed: "gpt-4o" };
  } catch (primaryError) {
    console.warn(
      `[${agentName}] OpenAI primary model failed, falling back to Mistral:`,
      primaryError,
    );
    try {
      const result = await generateObject({
        ...(options as any),
        model: secondaryModel,
      });
      return { result, modelUsed: "open-mixtral-8x7b" };
    } catch (secondaryError) {
      console.warn(
        `[${agentName}] Mistral secondary model failed, falling back to Gemini:`,
        secondaryError,
      );
      const result = await generateObject({
        ...(options as any),
        model: tertiaryModel,
      });
      return { result, modelUsed: "gemini-2.0-flash" };
    }
  }
}

/**
 * Generates text using a triple-model fallback strategy.
 * OpenAI -> Mistral -> Google
 */
export async function generateTextWithFallback(
  options: Omit<GenerateTextOptions, "model">,
  agentName: string,
) {
  try {
    const result = await generateText({
      ...(options as any),
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
        ...(options as any),
        model: secondaryModel,
      });
      return { result, modelUsed: "open-mixtral-8x7b" };
    } catch (secondaryError) {
      console.warn(
        `[${agentName}] Mistral secondary model failed, falling back to Gemini:`,
        secondaryError,
      );
      const result = await generateText({
        ...(options as any),
        model: tertiaryModel,
      });
      return { result, modelUsed: "gemini-2.0-flash" };
    }
  }
}
