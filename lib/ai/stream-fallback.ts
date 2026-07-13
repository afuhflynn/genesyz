import { generateText, streamText } from "ai";
import { modelChain } from "./models";

let resolvedModel: { model: object; name: string } | null = null;
let lastResolveTime = 0;
const RE_RESOLVE_INTERVAL = 60_000;

async function resolveStreamModel(
  agentName: string,
): Promise<{ model: object; name: string }> {
  const now = Date.now();
  if (resolvedModel && now - lastResolveTime < RE_RESOLVE_INTERVAL) {
    return resolvedModel;
  }

  for (const entry of modelChain) {
    try {
      await generateText({
        model: entry.model as any,
        prompt: ".",
      });
      resolvedModel = entry;
      lastResolveTime = now;
      return entry;
    } catch {
      console.warn(`[${agentName}] Probe failed for ${entry.name}`);
    }
  }

  const fallback = modelChain[modelChain.length - 1];
  resolvedModel = fallback;
  lastResolveTime = now;
  return fallback;
}

export async function streamTextWithFallback(
  params: Omit<Parameters<typeof streamText>[0], "model">,
  agentName: string,
): Promise<ReturnType<typeof streamText>> {
  const { model } = await resolveStreamModel(agentName);
  return streamText({ ...params, model: model as any } as any);
}
