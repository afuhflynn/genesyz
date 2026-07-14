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
  { name: "google:gemini-3.5-flash", model: google("gemini-3.5-flash") },
  ...(openrouter
    ? [
        {
          name: "openrouter:qwen/qwen3-coder:free",
          model: openrouter("qwen/qwen3-coder:free"),
        },
        {
          name: "openrouter:openrouter/free",
          model: openrouter("openrouter/free"),
        },
      ]
    : []),
];

export const model = modelChain[0].model;

export function getModel(index = 0) {
  const entry = modelChain[index];
  if (!entry) throw new Error(`No model at index ${index}`);
  return entry.model;
}
