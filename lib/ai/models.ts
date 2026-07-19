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

const geminiModels = [
  // Primary: Google Gemini 2.5 Flash (60 RPM free, ~$0.075/M input paid)
  { name: "google:gemini-2.5-flash", model: google("gemini-2.5-flash") },
  // Fallback: lighter Gemini (even higher rate limits, ~$0.04/M)
  { name: "google:gemini-2.5-flash-lite", model: google("gemini-2.5-flash-lite") },
  // Different quota bucket
  { name: "google:gemini-3.5-flash", model: google("gemini-3.5-flash") },
];

const mistralModels = [
  // Secondary: Mistral (API key available, cheap $0.10/M input, reliable)
  { name: "mistral:mistral-small-latest", model: mistral("mistral-small-latest") },
  { name: "mistral:mistral-medium-latest", model: mistral("mistral-medium-latest") },
];

const openRouterModels = openrouter
  ? [
      {
        name: "openrouter:google/gemini-2.5-flash:free",
        model: openrouter("google/gemini-2.5-flash:free"),
      },
      {
        name: "openrouter:meta-llama/llama-3.3-70b-instruct:free",
        model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
      },
      {
        name: "openrouter:qwen/qwen3-coder:free",
        model: openrouter("qwen/qwen3-coder:free"),
      },
      {
        name: "openrouter:nvidia/nemotron-3-super-120b-a12b:free",
        model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      },
      {
        name: "openrouter:openrouter/free",
        model: openrouter("openrouter/free"),
      },
    ]
  : [];

export const modelChain: ModelEntry[] =
  process.env.NODE_ENV === "development"
    ? [...mistralModels, ...openRouterModels, ...geminiModels]
    : [...geminiModels, ...mistralModels, ...openRouterModels];

export const model = modelChain[0].model;

export function getModel(index = 0) {
  const entry = modelChain[index];
  if (!entry) throw new Error(`No model at index ${index}`);
  return entry.model;
}
