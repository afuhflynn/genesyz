import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const OpportunitySchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string().optional(),
  category: z.enum([
    "FELLOWSHIP",
    "SCHOLARSHIP",
    "FUNDING",
    "COMPETITION",
    "ACCELERATOR",
    "GRANT",
    "MENTORSHIP",
    "OTHER",
  ]),
  eligibility: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
});

const OpportunitiesResponseSchema = z.array(OpportunitySchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;

    const startup = await db.startup.findFirst({
      where: {
        OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
        userId: session.user.id,
      },
      include: {
        idea: {
          select: {
            title: true,
            summary: true,
          },
        },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const prompt = `You are an expert at finding funding opportunities for startups. 
Based on the following startup information, generate 5-10 relevant funding opportunities that this startup can apply to.

Startup Name: ${startup.name}
Industry: ${startup.industry || "Not specified"}
Stage: ${startup.stage || "Not specified"}
Target Market: ${startup.targetMarket || "Not specified"}
Description: ${startup.description || startup.idea?.summary || "Not specified"}

For each opportunity, provide:
- title: The name of the opportunity (e.g., "Y Combinator W26", "Google for Startups Founders Fund")
- description: A brief description of what the opportunity offers
- url: The official application URL if known (use a placeholder like "https://example.com/apply" if unknown)
- category: One of FELLOWSHIP, SCHOLARSHIP, FUNDING, COMPETITION, ACCELERATOR, GRANT, MENTORSHIP, OTHER
- eligibility: Who is eligible to apply
- benefits: What benefits/rewards are offered
- deadline: Application deadline if known (use ISO format like "2026-03-15"), otherwise omit

Research current opportunities from:
- Major accelerators (Y Combinator, Techstars, Andreessen Horowitz, Sequoia, etc.)
- Government grants (SBIR, STTR, federal grants)
- VC funds offering grants
- Fellowships for founders
- Competitions with cash prizes
- Industry-specific funding

Return ONLY a JSON array of opportunities, no other text.`;

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: OpportunitiesResponseSchema,
      prompt,
    });

    const opportunities = object.map((opp) => ({
      ...opp,
      deadline: opp.deadline ? new Date(opp.deadline) : null,
    }));

    return NextResponse.json({ data: opportunities });
  } catch (error) {
    console.error("Error generating opportunities:", error);
    return NextResponse.json(
      { error: "Failed to generate opportunities" },
      { status: 500 },
    );
  }
}
