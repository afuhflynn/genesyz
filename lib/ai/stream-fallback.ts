import { streamText } from "ai";
import { modelChain } from "./models";

export async function streamTextWithFallback(
  params: Omit<Parameters<typeof streamText>[0], "model">,
  agentName: string,
): Promise<ReturnType<typeof streamText>> {
  const errors: string[] = [];

  for (const entry of modelChain) {
    try {
      console.log(`[${agentName}] Attempting stream with model: ${entry.name}`);
      const result = await streamText({
        ...params,
        model: entry.model as any,
      } as any);
      return result;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[${agentName}] Stream failed for ${entry.name}:`, message);
      errors.push(`${entry.name}: ${message}`);
    }
  }

  // Final fallback to the last model in the chain
  const fallbackEntry = modelChain[modelChain.length - 1];
  console.log(`[${agentName}] All models failed. Trying final fallback with: ${fallbackEntry.name}`);
  return streamText({
    ...params,
    model: fallbackEntry.model as any,
  } as any);
}
