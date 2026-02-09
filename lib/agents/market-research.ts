import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText } from "ai";
import { db } from "@/lib/db";
import {
  buildLocationResearchContext,
  formatLocationForPrompt,
} from "@/lib/location";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type InterpretedIdea,
  type MarketResearch,
  MarketResearchSchema,
} from "./types";

const primaryModel = mistral("open-mixtral-8x7b");
const fallbackModel = google("gemini-2.5-flash");

const SYSTEM_PROMPT = `You are a senior market research analyst with expertise in startup ecosystems, competitive analysis, and market sizing. Your role is to provide actionable market intelligence for founder ideas.

Guidelines:
- Provide realistic market size estimates with clear methodology
- Identify actual competitors, not made-up ones
- Focus on actionable insights, not generic observations
- Be honest about market challenges and barriers
- Consider both direct and indirect competition
- Note when data is estimated vs. verified`;

export async function runMarketResearchAgent(
  input: AgentInput,
): Promise<AgentOutput> {
  const { ideaId, previousOutputs, locationContext } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("MarketResearchAgent requires INTERPRETER output");
  }

  // Build location context for research
  let locationPromptSection = "";
  if (locationContext) {
    const locationResearchContext = buildLocationResearchContext({
      country: locationContext.country || "Global",
      countryCode: locationContext.countryCode || "GLOBAL",
      region: locationContext.region,
      city: locationContext.city,
      timezone: locationContext.timezone,
      currency: locationContext.currency,
      isGlobal: locationContext.isGlobal ?? !locationContext.country,
    });
    locationPromptSection = `\n\n${formatLocationForPrompt(locationResearchContext)}`;
  }

  const prompt = `Conduct market research for the following startup idea:

**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Problem:** ${interpretedIdea.problemStatement}
**Solution:** ${interpretedIdea.proposedSolution}
**Target Audience:** ${interpretedIdea.targetAudience.join(", ")}
**Category:** ${interpretedIdea.category}${locationPromptSection}

Provide market research with market size, up to 5 competitors (each with up to 3 strengths/weaknesses), up to 4 trends, up to 4 barriers, up to 4 opportunities. Keep total under 1500 words. Output valid JSON only.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  let result:
    | Awaited<ReturnType<typeof generateObject<typeof MarketResearchSchema>>>
    | undefined;
  let modelUsed: string = "gemini-2.5-flash";

  try {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        result = await generateObject({
          model: primaryModel,
          schema: MarketResearchSchema,
          system: SYSTEM_PROMPT,
          prompt,
        });
        modelUsed = "open-mixtral-8x7b";
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.warn(
      "[MARKET_RESEARCH] Mistral primary model failed after all retries, falling back to Gemini:",
      error,
    );
    result = await generateObject({
      model: fallbackModel,
      schema: MarketResearchSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    modelUsed = "gemini-2.5-flash";
  }

  if (!result) {
    throw new Error(
      "Failed to generate market research after all attempts and fallback",
    );
  }

  const marketResearch = result.object as MarketResearch;
  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "MARKET_RESEARCH",
      promptHash,
      prompt,
      response: JSON.stringify(marketResearch),
      model: modelUsed,
      tokensUsed: result.usage?.totalTokens || 0,
      latencyMs,
    },
  });

  // Calculate confidence based on market data availability
  const competitorCount = marketResearch.competitors.length;
  const hasMarketSize = Boolean(marketResearch.marketSize.global?.tam);
  const marketConfidence =
    marketResearch.marketSize.global?.confidence || "medium";
  const confidenceBonus =
    marketConfidence === "high"
      ? 0.3
      : marketConfidence === "medium"
        ? 0.2
        : 0.1;
  const confidence = Math.min(
    0.4 + competitorCount * 0.1 + (hasMarketSize ? confidenceBonus : 0),
    0.9,
  );

  return {
    agentType: "MARKET_RESEARCH",
    content: marketResearch,
    confidence,
    reasoning: `Identified ${competitorCount} competitors and ${marketResearch.marketSize.regional ? "regional + " : ""}global market sizing data`,
  };
}
