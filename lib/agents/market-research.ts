import { generateObjectWithFallback } from "@/lib/ai/fallback";
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

const SYSTEM_PROMPT = `You are a senior market research analyst with expertise in startup ecosystems, competitive analysis, and market sizing. Your role is to provide actionable market intelligence for founder ideas.

IMPORTANT - Market Size Data Requirements:
1. ALWAYS provide TAM, SAM, and SOM values for EVERY market size report
2. Provide values in BOTH USD and the local currency of the target market
3. Use "USD" as default if no specific target market is specified
4. If exact data is unavailable, ESTIMATE the value and set isEstimated: true
5. Include confidence levels (high/medium/low) for all market size estimates
6. Always convert to USD for global comparison purposes
7. Include market capitalization data for the relevant industry
8. Include potential startup valuation context for fundraising

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

Provide market research with the following STRUCTURE (Output valid JSON only):

1. MARKET SIZE (Required - MUST include ALL of these):
   - global: TAM, SAM, SOM with both USD and local currency values
   - regional: TAM, SAM, SOM for target region (if specified)
   - local: TAM, SAM, SOM for local market (if applicable)
   - For EACH market size include:
     * value: in local currency (e.g., "$50B" or "₹4.2T")
     * usdValue: equivalent in USD (e.g., "$50B")
     * currency: currency code (e.g., "USD", "INR", "EUR")
     * isEstimated: true if estimated, false if exact data
     * methodology: how calculated
     * confidence: high/medium/low
     * year: data year

2. MARKET CAPITALIZATION (Required):
   - globalMarketCap: Total industry market cap globally
   - industryMarketCap: Market cap of specific industry/sector
   - potentialStartupValuation: Comparable startup valuations for fundraising context
   - Each with value, usdValue, currency, isEstimated, methodology

3. COMPETITORS: Up to 5 competitors (each with name, description, strengths, weaknesses)

4. MARKET TRENDS: Up to 5 trends

5. BARRIERS: Up to 5 market barriers

6. OPPORTUNITIES: Up to 5 market opportunities

Keep total under 2000 words. Output valid JSON only.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const { result, modelUsed } = await generateObjectWithFallback({
    schema: MarketResearchSchema,
    system: SYSTEM_PROMPT,
    prompt,
  }, "MARKET_RESEARCH");

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
