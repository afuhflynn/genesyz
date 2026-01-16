import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText, stepCountIs } from "ai";
import { tools } from "@/lib/ai/tools";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  DeepResearchSchema,
  type InterpretedIdea,
} from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("mistral-large-latest");

const RESEARCH_SYSTEM_PROMPT = `You are a world-class startup researcher. Your goal is to find the "hard truths" about a startup idea.
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
  input: AgentInput
): Promise<AgentOutput> {
  const { ideaId, previousOutputs } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("DeepResearchAgent requires INTERPRETER output");
  }

  const startTime = Date.now();

  // Step 1: Gather Information using tools
  const { text: researchData, toolResults } = await generateText({
    model,
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: `Perform deep research for this startup idea:
Title: ${interpretedIdea.title}
Summary: ${interpretedIdea.summary}
Problem: ${interpretedIdea.problemStatement}
Solution: ${interpretedIdea.proposedSolution}
Category: ${interpretedIdea.category}

Search for real competitors, market gaps, and technical challenges.`,
    tools,
    stopWhen: stepCountIs(5), // Allow up to 5 steps of research
  });

  // Step 2: Synthesize into structured object
  const result = await generateObject({
    model,
    schema: DeepResearchSchema,
    system: SYNTHESIS_SYSTEM_PROMPT,
    prompt: `Based on the following research data, generate a structured deep research report:

${researchData}

Tool Results:
${JSON.stringify(toolResults, null, 2)}`,
  });

  const latencyMs = Date.now() - startTime;

  // Log the research call
  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "DEEP_RESEARCH",
      promptHash: await hashString(researchData),
      prompt: researchData,
      response: JSON.stringify(result.object),
      model: "gemini-3-flash-preview",
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
