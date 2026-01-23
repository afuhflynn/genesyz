import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type InterpretedIdea,
  TrendAnalysisSchema,
} from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("open-mixtral-8x7b");

const SYSTEM_PROMPT = `You are a technology and market trends analyst specializing in identifying timing windows for startup opportunities. Your role is to assess whether now is the right time for a given idea.

Guidelines:
- Consider technology readiness levels
- Analyze regulatory environment and trajectory
- Evaluate social and behavioral trends
- Be specific about timing - "right time" needs justification
- Consider global and regional differences
- Note emerging trends that could impact the idea`;

export async function runTrendAnalysisAgent(
  input: AgentInput,
): Promise<AgentOutput> {
  const { ideaId, previousOutputs } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("TrendAnalysisAgent requires INTERPRETER output");
  }

  const prompt = `Analyze market and technology trends for the following startup idea:

**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Category:** ${interpretedIdea.category}
**Target Audience:** ${interpretedIdea.targetAudience.join(", ")}

Assess the timing, technology readiness, and relevant trends that could impact this idea's success.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const result = await generateObject({
    model,
    schema: TrendAnalysisSchema,
    system: SYSTEM_PROMPT,
    prompt,
  });

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "TREND_ANALYSIS",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: "gemini-3-flash-preview",
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  const techReadiness = result.object.technologyReadiness.score;
  const confidence = Math.min(0.5 + techReadiness * 0.04, 0.9);

  return {
    agentType: "TREND_ANALYSIS",
    content: result.object,
    confidence,
    reasoning: `Technology readiness: ${techReadiness}/10, Timing: ${result.object.timingAssessment.verdict}`,
  };
}
