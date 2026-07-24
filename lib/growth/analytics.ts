import {
  FUNNEL_STAGE_LABELS,
  FUNNEL_STAGES,
  type FunnelStage,
} from "./constants";

type GrowthEventLike = {
  stage: string;
  count: number;
  value: number | null;
  channel?: string | null;
  campaignId?: string | null;
  experimentId?: string | null;
};

export function buildFunnelInsights(events: GrowthEventLike[]) {
  const totals = new Map<FunnelStage, { count: number; value: number }>();
  for (const stage of FUNNEL_STAGES) totals.set(stage, { count: 0, value: 0 });
  for (const event of events) {
    const stage = FUNNEL_STAGES.includes(event.stage as FunnelStage)
      ? (event.stage as FunnelStage)
      : "AWARENESS";
    const current = totals.get(stage)!;
    current.count += Math.max(0, event.count || 0);
    current.value += event.value ?? 0;
  }

  const stages = FUNNEL_STAGES.map((stage, index) => {
    const current = totals.get(stage)!;
    const previous = index === 0 ? null : totals.get(FUNNEL_STAGES[index - 1])!;
    const conversionRate =
      previous && previous.count > 0
        ? Math.round((current.count / previous.count) * 1000) / 10
        : null;
    return {
      stage,
      label: FUNNEL_STAGE_LABELS[stage],
      count: current.count,
      value: Math.round(current.value * 100) / 100,
      conversionRate,
      dropOffRate:
        conversionRate === null
          ? null
          : Math.max(0, Math.round((100 - conversionRate) * 10) / 10),
      warning: conversionRate !== null && conversionRate < 20,
    };
  });

  return {
    stages,
    totalSignals: events.reduce(
      (sum, event) => sum + Math.max(0, event.count || 0),
      0,
    ),
    warnings: stages
      .filter((stage) => stage.warning)
      .map(
        (stage) =>
          `${stage.label} is converting below 20% from the previous stage.`,
      ),
  };
}
