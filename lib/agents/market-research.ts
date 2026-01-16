import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type InterpretedIdea,
  type MarketResearch,
  MarketResearchSchema,
} from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("mistral-large-latest");

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

Provide market research with market size, up to 5 competitors (each with up to 3 strengths/weaknesses), up to 4 trends, up to 4 barriers, up to 4 opportunities. Keep total under 1500 words. Output valid JSON only.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  let result: Awaited<ReturnType<typeof generateObject>> | undefined;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      result = await generateObject({
        model,
        schema: MarketResearchSchema,
        system: SYSTEM_PROMPT,
        prompt,
      });
      break; // Success, exit loop
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        // Fallback: try text generation and parse manually
        console.error(
          "Object generation failed after retries, attempting fallback:",
          error,
        );
        const textResult = await generateText({
          model,
          system: SYSTEM_PROMPT,
          prompt: `${prompt}\n\nOutput valid JSON only matching the schema.`,
        });
        try {
          const parsed = JSON.parse(textResult.text);
          result = {
            object: MarketResearchSchema.parse(parsed) as any,
            usage: null,
            warnings: [],
            reasoning: "",
            finishReason: "stop",
          };
        } catch (parseError) {
          throw new Error(
            "Fallback parsing also failed: " +
              (parseError instanceof Error
                ? parseError.message
                : String(parseError)),
          );
        }
      } else {
        // Wait briefly before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
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
      model: "mistral-large-latest",
      tokensUsed: result.usage?.totalTokens || 0,
      latencyMs,
    },
  });

  // Calculate confidence based on market data availability
  const competitorCount = marketResearch.competitors.length;
  const hasMarketSize = Boolean(marketResearch.marketSize.tam);
  const confidence = Math.min(
    0.4 + competitorCount * 0.1 + (hasMarketSize ? 0.2 : 0),
    0.9,
  );

  return {
    agentType: "MARKET_RESEARCH",
    content: marketResearch,
    confidence,
    reasoning: `Identified ${competitorCount} competitors and market sizing data`,
  };
}
