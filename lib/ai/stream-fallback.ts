import { generateText, streamText } from "ai";
import { modelChain } from "./models";

const modelStatusCache: Record<string, boolean> = {};

async function isModelHealthy(entry: any): Promise<boolean> {
  const cached = modelStatusCache[entry.name];
  if (cached !== undefined) return cached;

  try {
    // Perform a very fast probe to verify the model and its API key are functional
    await generateText({
      model: entry.model,
      prompt: "test",
      maxOutputTokens: 1,
      abortSignal: AbortSignal.timeout(5000), // 5s timeout for health check
    });
    modelStatusCache[entry.name] = true;
    return true;
  } catch (error: any) {
    console.warn(`[Model Health Check] Model ${entry.name} is unhealthy:`, error.message || error);
    modelStatusCache[entry.name] = false;
    return false;
  }
}

export async function streamTextWithFallback(
  params: Omit<Parameters<typeof streamText>[0], "model"> & { instructions?: string },
  agentName: string,
): Promise<ReturnType<typeof streamText>> {
  // Normalize params: map "instructions" to "system" for streamText compatibility
  const normalizedParams = { ...params };
  if (normalizedParams.instructions && !normalizedParams.system) {
    normalizedParams.system = normalizedParams.instructions;
    delete normalizedParams.instructions;
  }

  const errors: string[] = [];

  // Filter modelChain to only include healthy models
  const healthyChain: any[] = [];
  for (const entry of modelChain) {
    if (await isModelHealthy(entry)) {
      healthyChain.push(entry);
    }
  }

  // Fallback to the full model chain if all models are detected as unhealthy
  const activeChain = healthyChain.length > 0 ? healthyChain : modelChain;

  for (const entry of activeChain) {
    try {
      console.log(`[${agentName}] Attempting stream with model: ${entry.name}`);
      const result = await streamText({
        ...normalizedParams,
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
    ...normalizedParams,
    model: fallbackEntry.model as any,
  } as any);
}
