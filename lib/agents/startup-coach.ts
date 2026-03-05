import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { z } from "zod";

const startupCoachSchema = z.object({
  verdict: z.enum(["ON_TRACK", "NEEDS_ATTENTION", "AT_RISK"]),
  confidence: z.number().min(0).max(1),
  analysis: z.object({
    positives: z.array(z.string()).describe("What's working well"),
    concerns: z.array(z.string()).describe("Areas of concern"),
    blindSpots: z
      .array(z.string())
      .describe("Things the founder might be missing"),
  }),
  recommendations: z
    .array(z.string())
    .describe("Specific actionable recommendations for next week"),
  trajectory: z.object({
    summary: z
      .string()
      .describe("Brief assessment of where this startup is heading"),
    weeksToMilestone: z
      .number()
      .nullable()
      .describe("Estimated weeks to next milestone, or null if unclear"),
    riskFactors: z
      .array(z.string())
      .describe("Key risks that could derail progress"),
  }),
});

export type StartupCoachOutput = z.infer<typeof startupCoachSchema>;

interface WeeklyUpdateData {
  weekNumber: number;
  isLaunched: boolean;
  weeksToLaunch: number | null;
  usersTalkedTo: number;
  userLearnings: string;
  primaryMetricType: string;
  primaryMetricValue: number;
  primaryMetricDelta: number | null;
  metricPeriod?: string | null;
  customMetricName?: string | null;
  additionalMetrics?: Array<{
    type: string;
    value: number;
    period?: string | null;
    customMetricName?: string | null;
  }> | null;
  previousGoalsReview?: Array<{
    goalText: string;
    completed: boolean;
  }> | null;
  goalsCompletionRate: number | null;
  moraleScore: number;
  topImprovements: string | null;
  biggestObstacle: string | null;
  goals: Array<{ content: string; priority: number; completed: boolean }>;
}

interface StartupContext {
  name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  stage: string;
  targetMarket: string | null;
  currentWeekNumber: number;
}

interface HistoricalData {
  updates: Array<{
    weekNumber: number;
    primaryMetricValue: number;
    primaryMetricDelta: number | null;
    usersTalkedTo: number;
    moraleScore: number;
    goals: Array<{ completed: boolean }>;
  }>;
  taskSummary?: {
    totalTasks: number;
    byStatus: {
      TODO: number;
      IN_PROGRESS: number;
      BLOCKED: number;
      DONE: number;
    };
    overdueTasks: number;
    upcomingTasks: number;
    completionRate: number;
  };
}

export async function analyzeWeeklyUpdate(
  update: WeeklyUpdateData,
  startup: StartupContext,
  history?: HistoricalData,
): Promise<StartupCoachOutput> {
  const additionalMetricsText = update.additionalMetrics?.length
    ? `\n- Additional metrics:\n${update.additionalMetrics
        .map((m) => {
          const name =
            m.type === "CUSTOM" && m.customMetricName
              ? m.customMetricName
              : m.type;
          return `  - ${name}: ${m.value}${m.period ? ` (${m.period.toLowerCase()})` : ""}`;
        })
        .join("\n")}`
    : "";

  const previousGoalsText = update.previousGoalsReview?.length
    ? `\n- Last week's goals completion: ${update.goalsCompletionRate !== null ? `${Math.round(update.goalsCompletionRate * 100)}%` : "N/A"} (${update.previousGoalsReview.filter((g) => g.completed).length}/${update.previousGoalsReview.length} completed)`
    : "";

  const prompt = `You are a blunt, direct startup coach analyzing a weekly update. Be honest, not encouraging. Your job is to help founders face reality.

## Startup Context
- Name: ${startup.name}
- ${startup.tagline ? `Tagline: ${startup.tagline}` : ""}
- ${startup.description ? `Description: ${startup.description}` : ""}
- Industry: ${startup.industry || "Not specified"}
- Stage: ${startup.stage}
- Target Market: ${startup.targetMarket || "Not specified"}
- Current Week: ${startup.currentWeekNumber}

## This Week's Update (Week ${update.weekNumber})
- Launched: ${update.isLaunched ? "Yes" : `No (${update.weeksToLaunch ?? "?"} weeks to launch)`}
- Users talked to: ${update.usersTalkedTo}
- User learnings: ${update.userLearnings}
${
  update.isLaunched
    ? `- Primary metric (${update.customMetricName || update.primaryMetricType}): ${update.primaryMetricValue}${update.metricPeriod ? ` (${update.metricPeriod.toLowerCase()})` : ""}
- Metric change from last week: ${update.primaryMetricDelta !== null ? `${update.primaryMetricDelta >= 0 ? "+" : ""}${update.primaryMetricDelta}` : "No previous data"}${additionalMetricsText}`
    : ""
}
- Founder morale: ${update.moraleScore}/10
- What improved the metric: ${update.topImprovements || "Not specified"}
- Biggest obstacle: ${update.biggestObstacle || "Not specified"}${previousGoalsText}
- Goals for next week: ${update.goals.map((g, i) => `${i + 1}. ${g.content}`).join("\n  ")}

${
  history?.updates?.length
    ? `## Historical Context (Last ${Math.min(history.updates.length, 4)} weeks)
${history.updates
  .slice(0, 4)
  .map(
    (h) =>
      `- Week ${h.weekNumber}: Metric ${h.primaryMetricValue}, Users ${h.usersTalkedTo}, Morale ${h.moraleScore}/10, Goals ${h.goals.filter((g) => g.completed).length}/${h.goals.length} completed`,
  )
  .join("\n")}
`
    : "## Historical Context\nNo previous updates yet."
}

## Task Execution Snapshot
${
  history?.taskSummary
    ? `- Total tasks: ${history.taskSummary.totalTasks}
- To Do: ${history.taskSummary.byStatus.TODO}
- In Progress: ${history.taskSummary.byStatus.IN_PROGRESS}
- Blocked: ${history.taskSummary.byStatus.BLOCKED}
- Done: ${history.taskSummary.byStatus.DONE}
- Overdue tasks: ${history.taskSummary.overdueTasks}
- Due in next 7 days: ${history.taskSummary.upcomingTasks}
- Completion rate: ${Math.round(history.taskSummary.completionRate * 100)}%`
    : "No task data available."
}

## Your Task
Provide a brutally honest analysis.

Verdict guidelines:
- ON_TRACK: Strong trajectory, metric growing, good user conversations, goals being completed
- NEEDS_ATTENTION: Some warning signs, metric flat or declining, low user engagement, inconsistent goal completion
- AT_RISK: Serious problems, no progress, founder burned out, no validation, goals not being met

Be specific in recommendations. Don't say "talk to more users" - say "you need to talk to at least 10 users per week, not ${update.usersTalkedTo}".

Consider the goals completion rate when assessing progress. If founders consistently don't complete their goals, that's a red flag.

For trajectory, estimate weeks to next meaningful milestone (launch, first paying customer, etc) based on current pace. If unclear, set weeksToMilestone to null.`;

  const { result, modelUsed } = await generateObjectWithFallback(
    {
      schema: startupCoachSchema,
      prompt,
    },
    "STARTUP_COACH",
  );

  console.log(`[STARTUP_COACH] Analysis complete using ${modelUsed}`);
  // @ts-ignore
  return result.object;
}

export function generateVerdictMessage(
  verdict: string,
  startupName: string,
): string {
  switch (verdict) {
    case "ON_TRACK":
      return `${startupName} is on track. Keep the momentum.`;
    case "NEEDS_ATTENTION":
      return `${startupName} needs attention. Some warning signs to address.`;
    case "AT_RISK":
      return `${startupName} is at risk. Serious issues need immediate action.`;
    default:
      return `Analysis complete for ${startupName}.`;
  }
}

// ===========================================
// Follower-Specific AI Analysis
// ===========================================

const followerAnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      "A brief 2-3 sentence summary of the startup's progress this week",
    ),
  comparisonWithPrevious: z
    .array(z.string())
    .describe("3-4 key observations comparing this week to previous weeks"),
  immediateActions: z
    .array(z.string())
    .describe(
      "1-3 specific, actionable items the founder should do immediately based on this week's data",
    ),
});

export type FollowerAnalysisOutput = z.infer<typeof followerAnalysisSchema>;

interface FollowerWeeklyUpdateData {
  weekNumber: number;
  isLaunched: boolean;
  usersTalkedTo: number;
  userLearnings: string;
  primaryMetricType: string;
  primaryMetricValue: number;
  primaryMetricDelta: number | null;
  metricPeriod?: string | null;
  metricFormat?: string | null;
  customMetricName?: string | null;
  moraleScore: number;
  topImprovements?: string | null;
  biggestObstacle?: string | null;
  goals: Array<{ content: string; priority: number }>;
}

interface FollowerStartupContext {
  name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  stage: string;
}

export async function generateFollowerAnalysis(
  currentUpdate: FollowerWeeklyUpdateData,
  startup: FollowerStartupContext,
  previousUpdates?: FollowerWeeklyUpdateData[],
): Promise<FollowerAnalysisOutput> {
  const previousUpdatesText =
    previousUpdates && previousUpdates.length > 0
      ? `
## Previous Weeks Context (for comparison)
${previousUpdates
  .slice(0, 3)
  .reverse()
  .map(
    (p) => `
- Week ${p.weekNumber}:
  - Users talked to: ${p.usersTalkedTo}
  - Primary metric: ${p.primaryMetricValue}${p.metricPeriod ? ` (${p.metricPeriod.toLowerCase()})` : ""}
  - Morale: ${p.moraleScore}/10
  - Key learnings: ${p.userLearnings?.substring(0, 150) || "N/A"}
`,
  )
  .join("\n")}
`
      : "";

  const prompt = `You are an AI assistant helping external followers understand a startup's weekly progress. Provide clear, insightful analysis that helps people who care about the startup understand what's happening.

## Startup Context
- Name: ${startup.name}
- ${startup.tagline ? `Tagline: ${startup.tagline}` : ""}
- ${startup.description ? `Description: ${startup.description}` : ""}
- Industry: ${startup.industry || "Not specified"}
- Stage: ${startup.stage}

## This Week's Update (Week ${currentUpdate.weekNumber})
- Launched: ${currentUpdate.isLaunched ? "Yes" : "No"}
- Users talked to: ${currentUpdate.usersTalkedTo}
- User learnings: ${currentUpdate.userLearnings}
${
  currentUpdate.isLaunched
    ? `- Primary metric (${currentUpdate.customMetricName || currentUpdate.primaryMetricType}): ${currentUpdate.primaryMetricValue}${currentUpdate.metricPeriod ? ` (${currentUpdate.metricPeriod.toLowerCase()})` : ""}
- Metric change from last week: ${currentUpdate.primaryMetricDelta !== null ? `${currentUpdate.primaryMetricDelta >= 0 ? "+" : ""}${currentUpdate.primaryMetricDelta}` : "N/A"}`
    : ""
}
- Founder morale: ${currentUpdate.moraleScore}/10
- What improved the metric: ${currentUpdate.topImprovements || "Not specified"}
- Biggest obstacle: ${currentUpdate.biggestObstacle || "Not specified"}
- Goals for next week: ${currentUpdate.goals.map((g, i) => `${i + 1}. ${g.content}`).join("\n  ")}

${previousUpdatesText}

## Your Task
Generate an analysis that:
1. **Summary**: Give a brief 2-3 sentence overview of how the startup did this week
2. **Comparison**: Identify 3-4 key patterns when comparing to previous weeks (trends, improvements, regressions)
3. **Immediate Actions**: Recommend 1-3 specific things the founder should do right now based on this week's data

Be informative but not overly technical. Followers may not be deeply involved in the day-to-day, so explain context clearly.`;

  const { result, modelUsed } = await generateObjectWithFallback(
    {
      schema: followerAnalysisSchema,
      prompt,
    },
    "FOLLOWER_ANALYSIS",
  );

  console.log(`[FOLLOWER_ANALYSIS] Analysis complete using ${modelUsed}`);
  // @ts-ignore
  return result.object;
}
