import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject, generateText, stepCountIs } from "ai";
import { tools } from "@/lib/ai/tools";
import { type PortfolioInput, StrategicAdvisorySchema } from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("mistral-medium-latest");

const ADVISORY_SYSTEM_PROMPT = `You are a top-tier venture capital partner and strategic advisor.
Your goal is to analyze a founder's entire portfolio of ideas and provide professional, actionable guidance.
You have access to web search and industry news tools. Use them to:
1. Get the latest "Market Pulse" for the categories the founder is working in.
2. Identify cross-portfolio themes and synergies.
3. Provide a "VC Corner" verdict with brutal honesty and investment potential.
4. Create a weekly action plan to move the needle.

Be sophisticated, data-driven, and direct.`;

export async function runStrategicAdvisoryAgent(
  input: PortfolioInput,
): Promise<unknown> {
  const { ideas } = input;

  const portfolioSummary = ideas
    .map(
      (idea) =>
        `- ${idea.title} (${idea.category}): ${idea.summary} [Score: ${idea.overallScore}]`,
    )
    .join("\n");

  // Step 1: Gather Market Pulse and Industry News
  const categories = Array.from(new Set(ideas.map((i) => i.category)));

  const { text: marketData, toolResults } = await generateText({
    model,
    system: ADVISORY_SYSTEM_PROMPT,
    prompt: `Analyze the following idea portfolio and provide strategic advisory:

Portfolio Summary:
${portfolioSummary}

Please fetch the latest industry news for these categories: ${categories.join(
      ", ",
    )}.
Synthesize how these market shifts affect the founder's portfolio.`,
    tools,
    stopWhen: stepCountIs(5),
  });

  // Step 2: Generate Structured Advisory Report
  const result = await generateObject({
    model,
    schema: StrategicAdvisorySchema,
    system: ADVISORY_SYSTEM_PROMPT,
    prompt: `Based on the portfolio analysis and real-time market data, generate a professional Strategic Advisory Report.

Portfolio:
${portfolioSummary}

Market Data & Research:
${marketData}

Tool Results:
${JSON.stringify(toolResults, null, 2)}`,
  });

  return result.object;
}
