import "dotenv/config";
import { generateText } from "ai";
import { modelChain } from "../lib/ai/models";

const modelStatusCache: Record<string, boolean> = {};

async function isModelHealthy(entry: any): Promise<boolean> {
  const cached = modelStatusCache[entry.name];
  if (cached !== undefined) return cached;

  try {
    await generateText({
      model: entry.model,
      prompt: "test",
      maxOutputTokens: 1,
    });
    modelStatusCache[entry.name] = true;
    return true;
  } catch (error: any) {
    console.warn(`[Health Check] Model ${entry.name} is unhealthy:`, error.message || error);
    modelStatusCache[entry.name] = false;
    return false;
  }
}

async function testHealthCheck() {
  console.log("Testing health check filtering...");
  
  const healthyChain = [];
  for (const entry of modelChain) {
    if (await isModelHealthy(entry)) {
      healthyChain.push(entry);
    }
  }
  
  console.log("\nHealthy models:", healthyChain.map(m => m.name));
  
  // Test second time to make sure cache works instantly
  const startTime = Date.now();
  const cachedHealthy = [];
  for (const entry of modelChain) {
    if (await isModelHealthy(entry)) {
      cachedHealthy.push(entry);
    }
  }
  console.log(`Cache lookup took: ${Date.now() - startTime}ms`);
}

testHealthCheck();
