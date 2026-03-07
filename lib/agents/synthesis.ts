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
  type ExecutionFriction,
  type InterpretedIdea,
  type MarketResearch,
  SynthesisSchema,
  type TrendAnalysis,
} from "./types";

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
  const { ideaId, previousOutputs, locationContext } = input;

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

  // Build location context for synthesis
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

  const prompt = `Synthesize the following research into a final assessment:

## Idea Overview
**Title:** ${interpretedIdea?.title || "Untitled"}
**Summary:** ${interpretedIdea?.summary || "No summary"}
**Problem:** ${interpretedIdea?.problemStatement || "Not specified"}
**Solution:** ${interpretedIdea?.proposedSolution || "Not specified"}
**Unique Value:** ${interpretedIdea?.uniqueValue || "Not specified"}

## Market Research
**Market Size (TAM):** ${marketResearch?.marketSize?.global?.tam?.value || "N/A"}${marketResearch?.marketSize?.regional ? ` (Regional: ${marketResearch.marketSize.regional.tam?.value || "N/A"})` : ""}
**Growth Rate:** ${marketResearch?.marketSize?.global?.growthRate?.value || "N/A"}
**Competitors:** ${marketResearch?.competitors?.map((c: any) => c.name).join(", ") || "None listed"}
**Key Barriers:** ${marketResearch?.barriers?.join(", ") || "None listed"}

## Timing Analysis
**Verdict:** ${trendAnalysis?.timingAssessment?.verdict || "N/A"}
**Reasoning:** ${trendAnalysis?.timingAssessment?.reasoning || "Not specified"}
**Tech Readiness:** ${trendAnalysis?.technologyReadiness?.score || "N/A"}/10

## Execution Assessment
**Technical Complexity:** ${executionFriction?.technicalComplexity?.score || "N/A"}/10
**Time to MVP:** ${executionFriction?.resourceRequirements?.timeToMvp || "Not specified"}
**Team Size Needed:** ${executionFriction?.resourceRequirements?.teamSize || "Not specified"}
**Key Risks:** ${executionFriction?.riskFactors?.map((r: any) => r.risk).join(", ") || "None listed"}${locationPromptSection}

Provide a comprehensive synthesis with scores, recommendations, and a clear verdict.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const { result, modelUsed } = await generateObjectWithFallback(
    {
      schema: SynthesisSchema,
      system: SYSTEM_PROMPT,
      prompt,
    },
    "SYNTHESIS",
  );

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "SYNTHESIS",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: modelUsed,
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
