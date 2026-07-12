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
  ExecutionFrictionSchema,
  type InterpretedIdea,
} from "./types";

const SYSTEM_PROMPT = `You are a seasoned startup operator and technical advisor. Your role is to assess the practical challenges of executing on a startup idea.

Guidelines:
- Be realistic about technical complexity
- Consider the founder's likely constraints (budget, team, time)
- Identify non-obvious dependencies and blockers
- Provide actionable mitigation strategies
- Suggest quick wins to build momentum
- Consider both technical and operational challenges`;

export async function runExecutionFrictionAgent(
  input: AgentInput,
): Promise<AgentOutput> {
  const { ideaId, previousOutputs, locationContext } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("ExecutionFrictionAgent requires INTERPRETER output");
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

  const prompt = `Assess the execution challenges for the following startup idea:

**Title:** ${interpretedIdea?.title || "Untitled"}
**Summary:** ${interpretedIdea?.summary || "No summary"}
**Problem:** ${interpretedIdea?.problemStatement || "Not specified"}
**Solution:** ${interpretedIdea?.proposedSolution || "Not specified"}
**Key Features:** ${interpretedIdea?.keyFeatures?.join(", ") || "Not specified"}
**Category:** ${interpretedIdea?.category || "Not specified"}${locationPromptSection}

Analyze technical complexity, resource requirements, risks, and provide actionable recommendations. Consider location-specific factors like talent availability, infrastructure, and local regulations.`;

  const promptHash = await hashString(prompt);

  const startTime = Date.now();

  const { result, modelUsed } = await generateObjectWithFallback(
    {
      schema: ExecutionFrictionSchema,
      system: SYSTEM_PROMPT,
      prompt,
    },
    "EXECUTION_FRICTION",
  );

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "EXECUTION_FRICTION",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: modelUsed,
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });
  // @ts-expect-error
  const techComplexity = result?.object?.technicalComplexity?.score;
  // @ts-expect-error
  const riskCount = result?.object?.riskFactors?.length;
  // Lower complexity and fewer high-severity risks = higher confidence
  const confidence = Math.max(
    0.4,
    0.9 - techComplexity * 0.03 - riskCount * 0.02,
  );

  return {
    agentType: "EXECUTION_FRICTION",
    content: result.object,
    confidence,
    reasoning: `Technical complexity: ${techComplexity}/10, ${riskCount} risk factors identified`,
  };
}
