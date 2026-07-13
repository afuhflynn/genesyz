import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

type ModelEntry = {
  name: string;
  model: object;
};

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

const openrouter = openRouterApiKey
  ? createOpenRouter({ apiKey: openRouterApiKey })
  : null;

export const modelChain: ModelEntry[] = [
  ...(openrouter
    ? [
        {
          name: "openrouter:google/gemini-2.0-flash-exp:free",
          model: openrouter("google/gemini-2.0-flash-exp:free"),
        },
        {
          name: "openrouter:mistralai/mistral-small-3.1-24b-instruct:free",
          model: openrouter("mistralai/mistral-small-3.1-24b-instruct:free"),
        },
        {
          name: "openrouter:meta-llama/llama-3.3-70b-instruct:free",
          model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
        },
      ]
    : []),
  { name: "google:gemini-3.5-flash", model: google("gemini-3.5-flash") },
];

export const model = modelChain[0].model;

export function getModel(index = 0) {
  const entry = modelChain[index];
  if (!entry) throw new Error(`No model at index ${index}`);
  return entry.model;
}
