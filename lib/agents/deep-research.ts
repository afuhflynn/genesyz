import {
  generateObjectWithFallback,
  generateTextWithFallback,
} from "@/lib/ai/fallback";
import { tools } from "@/lib/ai/tools";
import { db } from "@/lib/db";
import {
  buildLocationResearchContext,
  formatLocationForPrompt,
} from "@/lib/location";
import { hashString } from "@/lib/utils";
import { stepCountIs } from "ai";
import {
  type AgentInput,
  type DeepResearch,
  type DeepResearchOutput,
  DeepResearchSchema,
  type InterpretedIdea,
} from "./types";

const RESEARCH_SYSTEM_PROMPT = `You are a world-class startup researcher. Your goal is to find "hard truths" about a startup idea.
You have access to web search tools. Use them to:
1. Find real market gaps that aren't being addressed.
2. Identify specific technical or regulatory hurdles.
3. Look for failed startups in this space and understand why they failed.
4. Find current trends that make this idea timely (or untimely).

Be thorough. Don't just settle for the first search result.`;

const SYNTHESIS_SYSTEM_PROMPT = `You are a senior strategic advisor. You will be provided with research data about a startup idea.
Your task is to synthesize this data into a professional deep research report.
Focus on:
- Market Gaps: Where is the "white space"?
- Technical Roadmap: A realistic 3-phase plan.
- Pivot Options: If the core idea fails, where else can it go?
- Strategic Moat: How can this business become defensible?`;

export async function runDeepResearchAgent(
  input: AgentInput,
): Promise<DeepResearchOutput> {
  const { ideaId, previousOutputs, locationContext } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("DeepResearchAgent requires INTERPRETER output");
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

  const startTime = Date.now();

  // Step 1: Gather Information using tools
  const { result: textResult, modelUsed } = await generateTextWithFallback({
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: `Perform deep research for this startup idea:
Title: ${interpretedIdea.title}
Summary: ${interpretedIdea.summary}
Problem: ${interpretedIdea.problemStatement}
Solution: ${interpretedIdea.proposedSolution}
Category: ${interpretedIdea.category}${locationPromptSection}

Search for real competitors, market gaps, and technical challenges. Consider location-specific factors.`,
    tools,
    stopWhen: stepCountIs(5), // Allow up to 5 steps of research
  }, "DEEP_RESEARCH");

  const researchData = textResult.text;
  const toolResults = textResult.toolResults;

  // Step 2: Synthesize into structured object
  const { result: objResult, modelUsed: synthesisModelUsed } = await generateObjectWithFallback({
    schema: DeepResearchSchema,
    system: SYNTHESIS_SYSTEM_PROMPT,
    prompt: `Based on the following research data, generate a structured deep research report:

${researchData}

Tool Results:
${JSON.stringify(toolResults, null, 2)}`,
  }, "DEEP_RESEARCH_SYNTHESIS");

  const latencyMs = Date.now() - startTime;
  const deepResearchContent: DeepResearch = DeepResearchSchema.parse(
    objResult.object,
  );

  // Log research call
  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "DEEP_RESEARCH",
      promptHash: await hashString(researchData),
      prompt: researchData,
      response: JSON.stringify(deepResearchContent),
      model: `${modelUsed} + ${synthesisModelUsed}`,
      tokensUsed: objResult.usage?.totalTokens,
      latencyMs,
    },
  });

  return {
    agentType: "DEEP_RESEARCH",
    content: deepResearchContent,
    confidence: 0.85,
    reasoning: `Performed ${toolResults.length} web searches to validate market gaps and technical feasibility.`,
  };
}
