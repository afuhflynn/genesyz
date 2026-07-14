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
    : []),
  { name: "google:gemini-3.5-flash", model: google("gemini-3.5-flash") },
];

export const model = modelChain[0].model;

export function getModel(index = 0) {
  const entry = modelChain[index];
  if (!entry) throw new Error(`No model at index ${index}`);
  return entry.model;
}
