import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText, stepCountIs } from "ai";
import { tools } from "@/lib/ai/tools";
import { db } from "@/lib/db";
import {
  buildLocationResearchContext,
  formatLocationForPrompt,
} from "@/lib/location";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  DeepResearchSchema,
  type InterpretedIdea,
} from "./types";

const primaryModel = mistral("open-mixtral-8x7b");
const fallbackModel = google("gemini-2.5-flash");

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
): Promise<AgentOutput> {
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

  let modelUsed: string;

  // Step 1: Gather Information using tools
  let researchData: string;
  let toolResults: any[];

  try {
    const primaryResult = await generateText({
      model: primaryModel,
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
    });
    researchData = primaryResult.text;
    toolResults = primaryResult.toolResults;
    modelUsed = "open-mixtral-8x7b";
  } catch (error) {
    console.warn(
      "[DEEP_RESEARCH] Mistral primary model failed, falling back to Gemini for research:",
      error,
    );
    const fallbackResult = await generateText({
      model: fallbackModel,
      system: RESEARCH_SYSTEM_PROMPT,
      prompt: `Perform deep research for this startup idea:
Title: ${interpretedIdea.title}
Summary: ${interpretedIdea.summary}
Problem: ${interpretedIdea.problemStatement}
Solution: ${interpretedIdea.proposedSolution}
Category: ${interpretedIdea.category}

Search for real competitors, market gaps, and technical challenges.`,
      tools,
      stopWhen: stepCountIs(5),
    });
    researchData = fallbackResult.text;
    toolResults = fallbackResult.toolResults;
    modelUsed = "gemini-2.5-flash";
  }

  // Step 2: Synthesize into structured object
  const result = await generateObject({
    model: primaryModel,
    schema: DeepResearchSchema,
    system: SYNTHESIS_SYSTEM_PROMPT,
    prompt: `Based on the following research data, generate a structured deep research report:

${researchData}

Tool Results:
${JSON.stringify(toolResults, null, 2)}`,
  });

  const latencyMs = Date.now() - startTime;

  // Log research call
  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "DEEP_RESEARCH",
      promptHash: await hashString(researchData),
      prompt: researchData,
      response: JSON.stringify(result.object),
      model: modelUsed,
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  return {
    agentType: "DEEP_RESEARCH",
    content: result.object,
    confidence: 0.85,
    reasoning: `Performed ${toolResults.length} web searches to validate market gaps and technical feasibility.`,
  };
}
