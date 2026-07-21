import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import type { LanguageModel } from "ai";

type ModelEntry = {
  name: string;
  model: LanguageModel;
};

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

const openrouter = openRouterApiKey
  ? createOpenRouter({ apiKey: openRouterApiKey })
  : null;

// Primary Model
const geminiModel: ModelEntry = {
  name: "google:gemini-2.5-flash",
  model: google("gemini-2.5-flash"),
};

// Fallback Model
const fallbackModel: ModelEntry = openrouter
  ? {
      name: "openrouter:meta-llama/llama-3.3-70b-instruct:free",
      model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
    }
  : {
      name: "mistral:mistral-small-latest",
      model: mistral("mistral-small-latest"),
    };

export const modelChain: ModelEntry[] = [geminiModel, fallbackModel];

export const model = modelChain[0].model;

export function getModel(index = 0) {
  const entry = modelChain[index];
  if (!entry) throw new Error(`No model at index ${index}`);
  return entry.model;
}
