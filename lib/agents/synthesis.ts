import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type ExecutionFriction,
  type InterpretedIdea,
  type MarketResearch,
  SynthesisSchema,
  type TrendAnalysis,
} from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("mistral-medium-latest");

const SYSTEM_PROMPT = `You are a senior venture analyst synthesizing research into actionable recommendations for founders. Your role is to combine multiple perspectives into a coherent assessment.

Guidelines:
- Weight all inputs appropriately - no single factor dominates
- Provide honest, balanced assessments
- Scores should be calibrated (50 is average, 80+ is exceptional)
- Recommendations should be specific and actionable
- Consider the founder's perspective and constraints
- Be direct about whether to pursue or not`;

export async function runSynthesisAgent(
  input: AgentInput,
): Promise<AgentOutput> {
  const { ideaId, previousOutputs } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;
  const marketResearch = previousOutputs?.MARKET_RESEARCH
    ?.content as MarketResearch;
  const trendAnalysis = previousOutputs?.TREND_ANALYSIS
    ?.content as TrendAnalysis;
  const executionFriction = previousOutputs?.EXECUTION_FRICTION
    ?.content as ExecutionFriction;

  if (
    !interpretedIdea ||
    !marketResearch ||
    !trendAnalysis ||
    !executionFriction
  ) {
    throw new Error("SynthesisAgent requires all previous agent outputs");
  }

  const prompt = `Synthesize the following research into a final assessment:

## Idea Overview
**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Problem:** ${interpretedIdea.problemStatement}
**Solution:** ${interpretedIdea.proposedSolution}
**Unique Value:** ${interpretedIdea.uniqueValue}

## Market Research
**Market Size (TAM):** ${marketResearch.marketSize.tam}
**Growth Rate:** ${marketResearch.marketSize.growthRate}
**Competitors:** ${marketResearch.competitors.map((c) => c.name).join(", ")}
**Key Barriers:** ${marketResearch.barriers.join(", ")}

## Timing Analysis
**Verdict:** ${trendAnalysis.timingAssessment.verdict}
**Reasoning:** ${trendAnalysis.timingAssessment.reasoning}
**Tech Readiness:** ${trendAnalysis.technologyReadiness.score}/10

## Execution Assessment
**Technical Complexity:** ${executionFriction.technicalComplexity.score}/10
**Time to MVP:** ${executionFriction.resourceRequirements.timeToMvp}
**Team Size Needed:** ${executionFriction.resourceRequirements.teamSize}
**Key Risks:** ${executionFriction.riskFactors.map((r) => r.risk).join(", ")}

Provide a comprehensive synthesis with scores, recommendations, and a clear verdict.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const result = await generateObject({
    model,
    schema: SynthesisSchema,
    system: SYSTEM_PROMPT,
    prompt,
  });

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "SYNTHESIS",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: "gemini-3-flash-preview",
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  // Confidence based on consistency of all inputs
  const avgConfidence =
    (previousOutputs?.INTERPRETER?.confidence || 0) +
    (previousOutputs?.MARKET_RESEARCH?.confidence || 0) +
    (previousOutputs?.TREND_ANALYSIS?.confidence || 0) +
    (previousOutputs?.EXECUTION_FRICTION?.confidence || 0);
  const confidence = avgConfidence / 4;

  return {
    agentType: "SYNTHESIS",
    content: result.object,
    confidence,
    reasoning: `Synthesized from 4 research agents with average confidence ${(
      confidence * 100
    ).toFixed(0)}%`,
  };
}
