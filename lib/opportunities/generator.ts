import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { z } from "zod";
import { searchWithTavily } from "@/lib/ai/tools";
import {
  type GeneratedOpportunity,
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
- Provide official URLs when known; omit URL if uncertain.
- Use ISO date format (YYYY-MM-DD) for deadlines when known.
- Keep descriptions concise and practical for founders.
- Return only valid JSON array.`;

  let modelOutput: Array<z.infer<typeof OpportunitySchema>>;

  try {
    const result = await generateObject({
      model: mistral("open-mixtral-8x7b"),
      schema: OpportunitiesResponseSchema,
      prompt,
    });

    modelOutput = result.object;
  } catch (primaryError) {
    try {
      const fallbackResult = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: OpportunitiesResponseSchema,
        prompt,
      });

      modelOutput = fallbackResult.object;
    } catch (fallbackError) {
      const primaryMessage =
        primaryError instanceof Error ? primaryError.message : "Unknown error";
      const fallbackMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Unknown error";
      throw new Error(
        `MODEL_GENERATION_FAILED: primary=${primaryMessage}; fallback=${fallbackMessage}`,
      );
    }
  }

  const normalized = modelOutput
    .map(normalizeGeneratedOpportunity)
    .filter((item): item is GeneratedOpportunity => item !== null)
    .slice(0, maxResults);

  if (normalized.length === 0) {
    throw new Error("NO_VALID_OPPORTUNITIES_GENERATED");
  }

  return {
    opportunities: normalized,
    searchWarning,
  };
}
