import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { z } from "zod";

const hubCoachSchema = z.object({
  overview: z.object({
    sentiment: z.enum(["EXCELLENT", "STABLE", "CONCERNING", "CRITICAL"]),
    summary: z.string().describe("High-level summary of cohort health"),
    topBottleneck: z
      .string()
      .describe("The #1 issue facing the most startups right now"),
  }),
  cohortPatterns: z.array(
    z.object({
      observation: z.string(),
      impact: z.string(),
      recommendation: z
        .string()
        .describe(
          "What the hub manager should do (e.g., 'Organize a B2B sales workshop')",
        ),
    }),
  ),
  atRiskStartups: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
      suggestedIntervention: z.string(),
    }),
  ),
  kpiForecast: z.object({
    onTrack: z.boolean(),
    analysis: z.string().describe("Assessment of program-level KPIs"),
  }),
});

export type HubCoachOutput = z.infer<typeof hubCoachSchema>;

interface StartupBrief {
  name: string;
  stage: string;
  lastMorale: number;
  lastMetricDelta: number | null;
  flags: string[];
  recentObstacles: string[];
}

interface HubContext {
  name: string;
  programType: string;
  kpis: Array<{
    name: string;
    target: number;
    current: number;
    unit: string | null;
  }>;
  totalStartups: number;
}

export async function analyzeCohortHealth(
  hub: HubContext,
  startups: StartupBrief[],
): Promise<HubCoachOutput> {
  const prompt = `You are the "Accelerator Hub Coach," an AI advisor for accelerator managers. Your goal is to analyze the entire cohort's performance and provide strategic oversight.

## Accelerator Context
- Name: ${hub.name}
- Type: ${hub.programType}
- Active Startups: ${hub.totalStartups}
- Program KPIs:
${hub.kpis.map((k) => `  - ${k.name}: ${k.current}/${k.target} ${k.unit || ""}`).join("\n")}

## Cohort Data (Startup Briefs)
${startups
  .map(
    (s) => `
- ${s.name} (${s.stage}):
  - Latest Morale: ${s.lastMorale}/10
  - Latest Metric Delta: ${s.lastMetricDelta !== null ? (s.lastMetricDelta >= 0 ? "+" : "") + s.lastMetricDelta : "N/A"}
  - Active Flags: ${s.flags.length > 0 ? s.flags.join(", ") : "None"}
  - Recent Obstacles: ${s.recentObstacles.join("; ") || "None"}
`,
  )
  .join("\n")}

## Your Task
1. **Identify Patterns**: Are multiple startups struggling with the same thing (e.g., "5 startups mentioned 'legal hurdles'")?
2. **Assess Risk**: Which startups need immediate intervention from the hub manager?
3. **KPI Analysis**: Are the program-level KPIs likely to be met based on this velocity?
4. **Strategic Advice**: Suggest specific workshops, mentor sessions, or curriculum adjustments.

Be direct, analytical, and focus on "Hub-level" actions (what the manager can do for the group).`;

  const { result, modelUsed } = await generateObjectWithFallback(
    {
      schema: hubCoachSchema,
      prompt,
    },
    "HUB_COACH",
  );

  console.log(`[HUB_COACH] Analysis complete using ${modelUsed}`);
  // @ts-ignore
  return result.object;
}
