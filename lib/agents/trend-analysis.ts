import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
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
  TrendAnalysisSchema,
} from "./types";

const primaryModel = mistral("open-mixtral-8x7b");
const fallbackModel = google("gemini-2.5-flash");

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
  const { ideaId, previousOutputs, locationContext } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("TrendAnalysisAgent requires INTERPRETER output");
  }

  // Build location context for analysis
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

  const prompt = `Analyze market and technology trends for the following startup idea:

**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Category:** ${interpretedIdea.category}
**Target Audience:** ${interpretedIdea.targetAudience.join(", ")}${locationPromptSection}

Assess the timing, technology readiness, and relevant trends that could impact this idea's success. Consider both global and location-specific trends.`;

  const promptHash = await hashString(prompt);

  const startTime = Date.now();

  let result: Awaited<
    ReturnType<typeof generateObject<typeof TrendAnalysisSchema>>
  >;
  let modelUsed: string;

  try {
    result = await generateObject({
      model: primaryModel,
      schema: TrendAnalysisSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    modelUsed = "open-mixtral-8x7b";
  } catch (error) {
    console.warn(
      "[TREND_ANALYSIS] Mistral primary model failed, falling back to Gemini:",
      error,
    );
    result = await generateObject({
      model: fallbackModel,
      schema: TrendAnalysisSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    modelUsed = "gemini-2.5-flash";
  }

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "TREND_ANALYSIS",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: modelUsed,
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
