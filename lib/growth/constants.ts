export const GROWTH_CHANNELS = [
  "Organic Social",
  "Paid Social",
  "Search/SEO",
  "Email",
  "WhatsApp/SMS",
  "Content",
  "Community",
  "Partnerships",
  "Events",
  "Direct Sales",
  "Referrals",
  "Other",
] as const;

export const FUNNEL_STAGES = [
  "AWARENESS",
  "ACQUISITION",
  "ACTIVATION",
  "RETENTION",
  "REVENUE",
  "REFERRAL",
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  AWARENESS: "Awareness",
  ACQUISITION: "Acquisition",
  ACTIVATION: "Activation",
  RETENTION: "Retention",
  REVENUE: "Revenue",
  REFERRAL: "Referral",
};

export function normalizeStage(value: string | undefined): FunnelStage {
  const stage = value?.trim().toUpperCase();
  return FUNNEL_STAGES.includes(stage as FunnelStage)
    ? (stage as FunnelStage)
    : "AWARENESS";
}
