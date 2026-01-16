import { google } from "@ai-sdk/google";
import { generateObject, generateText, stepCountIs } from "ai";
import { tools } from "@/lib/ai/tools";
import { type PortfolioInput, StrategicAdvisorySchema } from "./types";

const model = google("gemini-2.5-flash");

const ADVISORY_SYSTEM_PROMPT = `You are Ideas Vault — an elite AI Chief of Staff. Your purpose is to act as a high-stakes advisor for early-stage founders, helping them cut through noise and make critical execution decisions.

CORE OPERATING PRINCIPLES:
1. JUDGMENT OVER ANALYSIS: Founders don't need more data; they need a decision. Your output must be opinionated and decisive.
2. DECISION-FIRST: Every idea must receive a clear "Go", "Pause", or "Kill" verdict.
3. STRUCTURED RISK: Categorize the "Top Risk" into one of these pre-defined categories: **Market**, **Product**, **Financial**, or **Team**.
4. ACTION-ORIENTED: Each verdict must include exactly ONE priority for the coming week and ONE thing to stop doing immediately.
5. DELTA DETECTION: You are a stateful advisor. Compare current metrics and signals against historical snapshots. If a trend is negative or an assumption is invalidated, flag it as a "Blind Spot."
6. BRAIN-DRILLING: Include 3-5 high-pressure questions that force the founder to confront uncomfortable truths about their business model or execution.

TONE: Professional, direct, sophisticated, and brutally honest. You are the founder's most trusted, yet most critical, board member.`;

export async function runStrategicAdvisoryAgent(
  input: PortfolioInput
): Promise<unknown> {
  const { ideas } = input;

  const portfolioSummary = ideas
    .map((idea) => {
      const lastSnapshot = idea.history?.[0];
      const metricsStr = idea.metrics
        ? JSON.stringify(idea.metrics)
        : "No metrics";
      const lastVerdict = lastSnapshot
        ? `[Last Verdict: ${lastSnapshot.verdict.verdict}]`
        : "[New Idea]";
      return `- ${idea.title} (${idea.category}): ${idea.summary} ${lastVerdict}\n  Metrics: ${metricsStr}`;
    })
    .join("\n");

  // Step 1: Gather Market Pulse and Industry News
  const categories = Array.from(new Set(ideas.map((i) => i.category)));

  const { text: marketData, toolResults } = await generateText({
    model,
    system: ADVISORY_SYSTEM_PROMPT,
    prompt: `Analyze the following idea portfolio and provide strategic advisory as a Chief of Staff.

Portfolio Summary & History:
${portfolioSummary}

Please fetch the latest industry news for these categories: ${categories.join(
      ", "
    )}.
Identify any deltas between the current state and previous snapshots.
Synthesize how market shifts or internal changes affect the founder's portfolio.`,
    tools,
    maxSteps: 5,
  } as any);

  // Step 2: Generate Structured Advisory Report
  const result = await generateObject({
    model,
    schema: StrategicAdvisorySchema,
    system: ADVISORY_SYSTEM_PROMPT,
    prompt: `Based on the portfolio analysis, historical deltas, and real-time market data, generate a professional Strategic Advisory Report.

    CRITICAL INSTRUCTION: Your verdicts must be opinionated. Use "Go" for ideas with strong momentum/signals, "Pause" for those needing validation, and "Kill" for those with invalidated assumptions or high friction.

    Portfolio & Historical Context:
    ${portfolioSummary}

    Market Intelligence & Research Findings:
    ${marketData}

    Detailed Tool Results (Signals/News):
    ${JSON.stringify(toolResults, null, 2)}

    Ensure each idea gets a clear Go/Pause/Kill verdict with structured topRisk (Market, Product, Financial, or Team).`,
  });

  return result.object;
}
