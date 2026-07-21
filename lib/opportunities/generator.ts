import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { searchWithTavily } from "@/lib/ai/tools";
import { z } from "zod";
import {
  type GeneratedOpportunity,
  isTrackableOpportunity,
  normalizeGeneratedOpportunity,
  OPPORTUNITY_CATEGORIES,
} from "./discovery";

const OpportunitySchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  url: z.string().trim().optional(),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  eligibility: z.string().trim().optional(),
  benefits: z.string().trim().optional(),
  deadline: z.string().trim().optional(),
});

const OpportunitiesResponseSchema = z.array(OpportunitySchema).min(1).max(12);

type OpportunitiesResponse = z.infer<typeof OpportunitiesResponseSchema>;

export interface StartupOpportunityProfile {
  startupName: string;
  industry?: string | null;
  stage?: string | null;
  targetMarket?: string | null;
  description?: string | null;
  ideaSummary?: string | null;
}

interface GenerateOpportunitiesOptions {
  maxResults?: number;
}

function buildSearchQueries(profile: StartupOpportunityProfile): string[] {
  const industry = profile.industry || "technology";
  const stage = profile.stage || "early-stage";
  const targetMarket = profile.targetMarket || "global";

  return [
    `${industry} startup grants and fellowships ${stage} 2026 application deadline`,
    `${industry} accelerator programs ${targetMarket} founders applications 2026`,
    `${industry} startup competitions and funding opportunities ${stage}`,
  ];
}

export async function generateStartupOpportunities(
  profile: StartupOpportunityProfile,
  options: GenerateOpportunitiesOptions = {},
): Promise<{ opportunities: GeneratedOpportunity[]; searchWarning?: string }> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 8, 3), 10);

  let tavilyContext = "";
  let searchWarning: string | undefined;

  try {
    const queries = buildSearchQueries(profile);
    const searchResults = await Promise.all(
      queries.map((query) =>
        searchWithTavily(query, {
          maxResults: 4,
          searchDepth: "advanced",
        }),
      ),
    );

    tavilyContext = JSON.stringify(
      searchResults.map((result) => ({
        query: result.query,
        answer: result.answer,
        results: result.results.slice(0, 4),
      })),
      null,
      2,
    );
  } catch (error) {
    searchWarning =
      error instanceof Error
        ? `Live Tavily search unavailable: ${error.message}`
        : "Live Tavily search unavailable";
  }

  const prompt = `You are an expert startup funding researcher.

Generate ${maxResults} relevant opportunities for this startup.

Startup Name: ${profile.startupName}
Industry: ${profile.industry || "Not specified"}
Stage: ${profile.stage || "Not specified"}
Target Market: ${profile.targetMarket || "Not specified"}
Description: ${profile.description || profile.ideaSummary || "Not specified"}

${
  tavilyContext
    ? `Use this live Tavily research context (prioritize these sources):\n${tavilyContext}`
    : "No live web context is available. Use your best current knowledge and avoid fabricated links."
}

Rules:
- Return ${maxResults} opportunities if possible, minimum 3.
- Focus on grants, accelerators, competitions, fellowships, and mentorships.
- Provide official application URLs for every opportunity (must be valid http/https).
- Use ISO date format (YYYY-MM-DD) deadlines for every opportunity.
- Only include opportunities with deadlines on or after today (UTC).
- Keep descriptions concise and practical for founders.
- Return only valid JSON array.`;

  const { result } = await generateObjectWithFallback<OpportunitiesResponse>(
    {
      schema: OpportunitiesResponseSchema,
      prompt,
    },
    "OPPORTUNITY_GENERATOR",
  );

  const modelOutput = result.object;

  if (!modelOutput || !Array.isArray(modelOutput)) {
    throw new Error("NO_VALID_OPPORTUNITIES_GENERATED");
  }

  const normalized = modelOutput
    .map(normalizeGeneratedOpportunity)
    .filter((item): item is GeneratedOpportunity => item !== null)
    .filter((item) => isTrackableOpportunity(item))
    .slice(0, maxResults);

  if (normalized.length === 0) {
    throw new Error("NO_VALID_OPPORTUNITIES_GENERATED");
  }

  return {
    opportunities: normalized,
    searchWarning,
  };
}
