import type { OpportunityCategory } from "@prisma/client";

const TRACKING_QUERY_PARAMS = [
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "source",
];

export const OPPORTUNITY_CATEGORIES = [
  "FELLOWSHIP",
  "SCHOLARSHIP",
  "FUNDING",
  "COMPETITION",
  "ACCELERATOR",
  "GRANT",
  "MENTORSHIP",
  "OTHER",
] as const;

export type OpportunityCategoryValue = (typeof OPPORTUNITY_CATEGORIES)[number];

export interface GeneratedOpportunity {
  title: string;
  description: string;
  url?: string;
  category: OpportunityCategory;
  eligibility?: string;
  benefits?: string;
  deadline?: Date | null;
}

function getUtcStartOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeOpportunityUrl(url?: string): string | undefined {
  if (!url) return undefined;

  const rawUrl = url.trim();
  if (!rawUrl) return undefined;

  try {
    const parsed = rawUrl.startsWith("http")
      ? new URL(rawUrl)
      : new URL(`https://${rawUrl}`);

    parsed.hash = "";
    parsed.searchParams.forEach((_, key) => {
      if (
        key.startsWith("utm_") ||
        TRACKING_QUERY_PARAMS.includes(key.toLowerCase())
      ) {
        parsed.searchParams.delete(key);
      }
    });

    const normalizedPath = parsed.pathname.replace(/\/$/, "");
    parsed.pathname = normalizedPath || "/";

    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function isValidOpportunityUrl(url?: string | null): boolean {
  if (!url) return false;
  return Boolean(normalizeOpportunityUrl(url));
}

export function isDeadlineOnOrAfterTodayUTC(
  deadline?: Date | string | null,
): boolean {
  if (!deadline) return false;

  const parsedDeadline =
    deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    return false;
  }

  const todayUtc = getUtcStartOfDay(new Date());
  const deadlineUtc = getUtcStartOfDay(parsedDeadline);

  return deadlineUtc.getTime() >= todayUtc.getTime();
}

export function isTrackableOpportunity(opportunity: {
  deadline?: Date | string | null;
  url?: string | null;
}): boolean {
  return (
    isValidOpportunityUrl(opportunity.url) &&
    isDeadlineOnOrAfterTodayUTC(opportunity.deadline)
  );
}

function parseDeadline(deadline?: string): Date | null {
  if (!deadline) return null;
  const parsed = new Date(deadline);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapOpportunityCategory(value: string): OpportunityCategory {
  const normalizedValue = value.toUpperCase() as OpportunityCategoryValue;
  if (OPPORTUNITY_CATEGORIES.includes(normalizedValue)) {
    return normalizedValue;
  }
  return "OTHER";
}

export function buildOpportunityKey(opportunity: {
  title: string;
  url?: string | null;
}): string {
  const normalizedTitle = normalizeTitle(opportunity.title);
  const normalizedUrl = normalizeOpportunityUrl(opportunity.url ?? undefined);

  if (!normalizedUrl) {
    return normalizedTitle;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    return `${normalizedTitle}::${parsedUrl.hostname.toLowerCase()}${parsedUrl.pathname}`;
  } catch {
    return normalizedTitle;
  }
}

export function normalizeGeneratedOpportunity(input: {
  title: string;
  description: string;
  url?: string;
  category: string;
  eligibility?: string;
  benefits?: string;
  deadline?: string;
}): GeneratedOpportunity | null {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);

  if (!title || !description) {
    return null;
  }

  return {
    title,
    description,
    url: normalizeOpportunityUrl(input.url),
    category: mapOpportunityCategory(input.category),
    eligibility: normalizeText(input.eligibility),
    benefits: normalizeText(input.benefits),
    deadline: parseDeadline(input.deadline),
  };
}

export function dedupeOpportunities<
  T extends { title: string; url?: string | null },
>(
  existing: Array<{ title: string; url?: string | null }>,
  candidates: T[],
): T[] {
  const existingKeys = new Set(existing.map(buildOpportunityKey));
  const candidateKeys = new Set<string>();

  return candidates.filter((candidate) => {
    const key = buildOpportunityKey(candidate);
    if (existingKeys.has(key) || candidateKeys.has(key)) {
      return false;
    }

    candidateKeys.add(key);
    return true;
  });
}
