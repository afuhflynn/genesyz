import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type InterpretedIdea,
  MarketResearchSchema,
} from "./types";

const model = google("gemini-2.5-flash");

const SYSTEM_PROMPT = `You are a senior market research analyst with expertise in startup ecosystems, competitive analysis, and market sizing. Your role is to provide actionable market intelligence for founder ideas.

Guidelines:
- Provide realistic market size estimates with clear methodology
- Identify actual competitors, not made-up ones
- Focus on actionable insights, not generic observations
- Be honest about market challenges and barriers
- Consider both direct and indirect competition
- Note when data is estimated vs. verified`;

export async function runMarketResearchAgent(
  input: AgentInput
): Promise<AgentOutput> {
  const { ideaId, previousOutputs } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("MarketResearchAgent requires INTERPRETER output");
  }

  const prompt = `Conduct market research for the following startup idea:

**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Problem:** ${interpretedIdea.problemStatement}
**Solution:** ${interpretedIdea.proposedSolution}
**Target Audience:** ${interpretedIdea.targetAudience.join(", ")}
**Category:** ${interpretedIdea.category}

Provide comprehensive market research including market sizing, competitor analysis, and market trends.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const result = await generateObject({
    model,
    schema: MarketResearchSchema,
    system: SYSTEM_PROMPT,
    prompt,
  });

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "MARKET_RESEARCH",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: "gemini-2.5-flash",
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  // Calculate confidence based on market data availability
  const competitorCount = result.object.competitors.length;
  const hasMarketSize = Boolean(result.object.marketSize.tam);
  const confidence = Math.min(
    0.4 + competitorCount * 0.1 + (hasMarketSize ? 0.2 : 0),
    0.9
  );

  return {
    agentType: "MARKET_RESEARCH",
    content: result.object,
    confidence,
    reasoning: `Identified ${competitorCount} competitors and market sizing data`,
  };
}
