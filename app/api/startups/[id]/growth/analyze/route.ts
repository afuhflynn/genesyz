import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkWorkspaceCapability, consumeAICredit, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "edit_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }

    const decision = await checkRateLimit(req, session.user.id, ajAI);
    if (decision) return rateLimitResponse(decision);

    const { copyText, personaId } = await req.json();

    if (!copyText) {
      return NextResponse.json(
        { error: "Missing copywriting text" },
        { status: 400 },
      );
    }

    const aiCredit = await consumeAICredit(session.user.id);
    if (!aiCredit.allowed) {
      return NextResponse.json(
        { error: "Your workspace has no AI credits remaining." },
        { status: 402 },
      );
    }

    let personaContext = "";
    if (personaId) {
      const persona = await db.customerPersona.findFirst({
        where: { id: personaId, startupId: access.startupId },
      });
      if (persona) {
        personaContext = `Target Customer Persona details:
- Name: ${persona.name}
- Description: ${persona.description}
- Pain Points: ${JSON.stringify(persona.painPoints)}
- Channels: ${JSON.stringify(persona.channels)}
- Psychographics: ${persona.psychographics}
`;
      }
    }

    const prompt = `You are a world-class growth copywriter and marketing diagnostic specialist.
Analyze this marketing copy (emails, landing page hero headers, social media ads) and grade its effectiveness.

Copy to analyze:
"${copyText}"

${personaContext ? personaContext : "Targeting a general early-stage market."}

Evaluate the copy and output a JSON response matching this schema exactly:
{
  "clarityScore": 80, // integer 0-100
  "emotionScore": 75, // integer 0-100
  "ctaScore": 90, // integer 0-100
  "alignmentScore": 85, // integer 0-100
  "loopholes": ["Weakness 1", "Weakness 2"], // Conversion leaks, targeting mismatches
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"] // Concrete edits to optimize readability, hooks, or call-to-actions
}
`;

    const { result } = await generateObjectWithFallback<{
      clarityScore: number;
      emotionScore: number;
      ctaScore: number;
      alignmentScore: number;
      loopholes: string[];
      suggestions: string[];
    }>(
      {
        schema: z.object({
          clarityScore: z.number().int().min(0).max(100),
          emotionScore: z.number().int().min(0).max(100),
          ctaScore: z.number().int().min(0).max(100),
          alignmentScore: z.number().int().min(0).max(100),
          loopholes: z.array(z.string()),
          suggestions: z.array(z.string()),
        }),
        prompt,
      },
      "GROWTH_ANALYZE",
    );

    const data = result.object;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GROWTH_ANALYZE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
