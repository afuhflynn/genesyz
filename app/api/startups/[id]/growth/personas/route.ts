import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkWorkspaceCapability, consumeAICredit, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }

    const decision = await checkRateLimit(req, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const personas = await db.customerPersona.findMany({
      where: { startupId: access.startupId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: personas });
  } catch (error) {
    console.error("[PERSONAS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const decision = await checkRateLimit(req, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const body = await req.json();
    const {
      action,
      name,
      description,
      painPoints,
      channels,
      psychographics,
      score,
      avatar,
    } = body;

    // AI Generation Option
    if (action === "generate_ai") {
      const aiCredit = await consumeAICredit(session.user.id);
      if (!aiCredit.allowed) {
        return NextResponse.json(
          { error: "Your workspace has no AI credits remaining." },
          { status: 402 },
        );
      }

      const startup = await db.startup.findUnique({
        where: { id: access.startupId },
      });

      if (!startup) {
        return NextResponse.json(
          { error: "Startup not found" },
          { status: 404 },
        );
      }

      const prompt = `Model a high-fidelity Customer Persona for a startup named "${startup.name}".
Startup description: ${startup.description || "A early stage tech platform."}

Provide a JSON object representing the buyer persona. The JSON MUST follow this format exactly:
{
  "name": "A short, descriptive, alliterative name, e.g. Freelancer Frank or Corporate Clara",
  "avatar": "A single suitable emoji representing their role, e.g. 💻 or 📈",
  "description": "A concise, realistic biography of who they are and what they do.",
  "painPoints": ["Point 1", "Point 2", "Point 3"],
  "channels": ["Channel 1", "Channel 2"],
  "psychographics": "A description of their values, lifestyle, and buying triggers.",
  "score": 85
}
`;

      const { result } = await generateObjectWithFallback<{
        name: string;
        avatar: string;
        description: string;
        painPoints: string[];
        channels: string[];
        psychographics: string;
        score: number;
      }>(
        {
          schema: z.object({
            name: z.string(),
            avatar: z.string(),
            description: z.string(),
            painPoints: z.array(z.string()),
            channels: z.array(z.string()),
            psychographics: z.string(),
            score: z.number().int().min(0).max(100),
          }),
          prompt,
        },
        "GROWTH_PERSONAS",
      );

      const data = result.object;

      const persona = await db.customerPersona.create({
        data: {
          startupId: access.startupId,
          name: data.name || "Target Persona",
          avatar: data.avatar || "💡",
          description: data.description || "",
          painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
          channels: Array.isArray(data.channels) ? data.channels : [],
          psychographics: data.psychographics || "",
          score: typeof data.score === "number" ? data.score : 80,
        },
      });

      return NextResponse.json({ data: persona }, { status: 201 });
    }

    // Manual Creation Option
    if (!name || !description) {
      return NextResponse.json(
        { error: "Missing name or description" },
        { status: 400 },
      );
    }

    const persona = await db.customerPersona.create({
      data: {
        startupId: access.startupId,
        name,
        avatar: avatar || "💡",
        description,
        painPoints: Array.isArray(painPoints) ? painPoints : [],
        channels: Array.isArray(channels) ? channels : [],
        psychographics: psychographics || "",
        score: typeof score === "number" ? score : 80,
      },
    });

    return NextResponse.json({ data: persona }, { status: 201 });
  } catch (error) {
    console.error("[PERSONAS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
