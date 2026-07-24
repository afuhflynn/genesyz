import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateStartupOpportunities } from "@/lib/opportunities/generator";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { consumeAICredit } from "@/lib/polar/workspace-entitlements";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;

    const access = await checkStartupAccess(startupIdOrSlug, "manage_tasks");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const aiCredit = await consumeAICredit(session.user.id);
    if (!aiCredit.allowed) return NextResponse.json({ error: "Your workspace has no AI credits remaining.", code: "PLAN_LIMIT_REACHED", resource: "ai" }, { status: 402 });

    const startup = await db.startup.findUnique({
      where: { id: access.startupId },
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

    const { opportunities, searchWarning } = await generateStartupOpportunities(
      {
        startupName: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        targetMarket: startup.targetMarket,
        description: startup.description,
        ideaSummary: startup.idea?.summary,
      },
    );

    return NextResponse.json({
      data: opportunities,
      meta: {
        usedTavilySearch: !searchWarning,
        searchWarning,
      },
    });
  } catch (error) {
    console.error("Error generating opportunities:", error);

    if (error instanceof Error) {
      if (error.message.includes("MODEL_GENERATION_FAILED")) {
        return NextResponse.json(
          { error: "AI provider unavailable. Please retry in a few moments." },
          { status: 502 },
        );
      }

      if (error.message.includes("NO_VALID_OPPORTUNITIES_GENERATED")) {
        return NextResponse.json(
          {
            error:
              "No valid opportunities were generated. Try again with more startup details.",
          },
          { status: 422 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate opportunities" },
      { status: 500 },
    );
  }
}
