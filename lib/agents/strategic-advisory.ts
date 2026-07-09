import { isStepCount } from "ai";
import {
  generateObjectWithFallback,
  generateTextWithFallback,
} from "@/lib/ai/fallback";
import { tools } from "@/lib/ai/tools";
import { type PortfolioInput, StrategicAdvisorySchema } from "./types";

const ADVISORY_SYSTEM_PROMPT = `You are Ideas Vault — an elite AI Chief of Staff. Your purpose is to act as a high-stakes advisor for early-stage founders, helping them cut through noise and make critical execution decisions.

CORE OPERATING PRINCIPLES:
1. JUDGMENT OVER ANALYSIS: Founders don't need more data; they need a decision. Your output must be opinionated and decisive.
2. DECISION-FIRST: Every idea must receive a clear "Go", "Pause", or "Kill" verdict.
3. STRUCTURED RISK: Categorize the "Top Risk" into one of these pre-defined categories: **Market**, **Product**, **Financial**, or **Team**.
4. ACTION-ORIENTED: Each verdict must include exactly ONE priority for the coming week and ONE thing to stop doing immediately.
5. DELTA DETECTION: You are a stateful advisor. Compare current metrics and signals against historical snapshots. If a trend is negative or an assumption is invalidated, flag it as a "Blind Spot."
6. BRAIN-DRILLING: Include 3-5 high-pressure questions that force the founder to confront uncomfortable truths about their business model or execution.
7. PRIORITIZATION: Designate ONE PRIMARY FOCUS idea with 50-80% time allocation. Other ideas should be "validation" or "monitoring" with ≤20% allocation each.
8. MEASURABLE OUTCOMES: Every action must have specific, quantifiable success criteria (e.g., "2 paid commitments" or "pilot call scheduled with Gates Foundation").
9. KILL CRITERIA: Every action must have explicit, timeboxed kill criteria (e.g., "If no paid or LOI-backed pilot within 30 days, pause development").

TONE: Professional, direct, sophisticated, and brutally honest. You are the founder's most trusted, yet most critical, board member.`;

export async function runStrategicAdvisoryAgent(
  input: PortfolioInput,
): Promise<unknown> {
  try {
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

    const { result: textResult } = await generateTextWithFallback({
      system: ADVISORY_SYSTEM_PROMPT,
      prompt: `Analyze the following idea portfolio and provide strategic advisory as a Chief of Staff.

Portfolio Summary & History:
${portfolioSummary}

Please fetch the latest industry news for these categories: ${categories.join(
        ", ",
      )}.
Identify any deltas between the current state and previous snapshots.
Synthesize how market shifts or internal changes affect the founder's portfolio.`,
      tools,
      stopWhen: isStepCount(5),
    }, "STRATEGIC_ADVISORY_RESEARCH");

    const marketData = textResult.text;
    const toolResults = textResult.toolResults;

    // Step 2: Generate Structured Advisory Report with Weekly Strategic Format
    const { result: objResult } = await generateObjectWithFallback({
      schema: StrategicAdvisorySchema,
      system: ADVISORY_SYSTEM_PROMPT,
      prompt: `Based on the portfolio analysis, historical deltas, and real-time market data, generate a professional Weekly Strategic Report with the following structure:

    CRITICAL INSTRUCTIONS:
    1. Designate ONE PRIMARY FOCUS idea with 50-80% time allocation (prefer CropGuard unless evidence strongly contradicts).
    2. Other ideas must be "validation" or "monitoring" with ≤20% allocation each.
    3. Every action must have specific, quantifiable success criteria (e.g., "2 paid commitments" or "pilot call scheduled with Gates Foundation").
    4. Every action must have explicit, timeboxed kill criteria (e.g., "If no paid or LOI-backed pilot within 30 days, pause development").
    5. Include exactly 3 Market Pulse highlights.
    6. Provide exactly 3 prioritized actions per idea in the Strategic Roadmap.
    7. Include "Why this might fail" with one blunt failure reason per idea.

    Portfolio & Historical Context:
    ${portfolioSummary}

    Market Intelligence & Research Findings:
    ${marketData}

    Detailed Tool Results (Signals/News):
    ${JSON.stringify(toolResults, null, 2)}

    Generate the report with all required fields including:
    - primaryFocus with ideaTitle and allocation (50-80%)
    - executiveSummary (2-3 sentences)
    - marketPulse (3 highlights)
    - strategicRoadmap (3 actions per idea)
    - weeklyActionPlan with all required fields
    - vcCorner with investorAngle
    - riskCliffs with failureReasons
    - All actions must have success_criteria and kill_criteria`,
    }, "STRATEGIC_ADVISORY_SYNTHESIS");

    return objResult.object;
  } catch (error) {
    throw new Error(
      `Strategic Advisory Agent Error: ${(error as Error).message}`,
    );
  }
}
