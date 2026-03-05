import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { openai } from "@ai-sdk/openai";

/**
 * Centralized AI Model Fallback Strategy
 *
 * Hierarchy:
 * 1. Primary: OpenAI GPT-4o (Most capable for heavy reasoning/synthesis)
 * 2. Secondary: Mistral Mixtral 8x7b (Cost-effective and reliable backup)
 * 3. Tertiary: Google Gemini 2.0 Flash (Resilient final fallback)
 */

export const models = {
  primary: openai("gpt-4o"),
  secondary: mistral("open-mixtral-8x7b"),
  tertiary: google("gemini-2.5-flash"),
} as const;

/**
 * Helper to get models for agent use
 * Returns models in the preferred order
 */
export function getModels() {
  return {
    primaryModel: models.primary,
    secondaryModel: models.secondary,
    tertiaryModel: models.tertiary,
  };
}
