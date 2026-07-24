import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkWorkspaceCapability, consumeAICredit, entitlementErrorResponse, refundAICredit } from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";

const SuggestionSchema = z.object({
  tasks: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000),
    priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]),
    dueInDays: z.number().int().min(0).max(90).nullable(),
    phase: z.string().trim().min(1).max(80),
  })).min(3).max(12),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: startupIdOrSlug, experimentId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");
    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }

    const decision = await checkRateLimit(request, session.user.id, ajAI);
    if (decision) return rateLimitResponse(decision);

    const experiment = await db.growthExperiment.findFirst({
      where: { id: experimentId, startupId: access.startupId },
      include: { campaign: true, startup: { select: { name: true, description: true, industry: true } } },
    });
    if (!experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });

    const aiCredit = await consumeAICredit(session.user.id);
    if (!aiCredit.allowed) {
      return NextResponse.json({ error: "Your workspace has no AI credits remaining." }, { status: 402 });
    }

    try {
      const prompt = `Create an actionable execution checklist for this startup growth experiment.

Startup: ${experiment.startup.name}
Industry: ${experiment.startup.industry || "Not specified"}
Startup context: ${experiment.startup.description || "Early-stage startup"}
Experiment: ${experiment.title}
Hypothesis: ${experiment.hypothesis}
Metrics: ${experiment.metrics}
Campaign: ${experiment.campaign ? `${experiment.campaign.name} on ${experiment.campaign.channel}` : "Standalone experiment"}

Return 3-12 concrete tasks covering setup, launch, measurement, and review. Make every task independently actionable by a startup team. Use dueInDays relative to today; use null when timing cannot be inferred. Do not assign people or create tasks. Return only the requested JSON shape.`;

      const { result } = await generateObjectWithFallback<{ tasks: Array<{ title: string; description: string; priority: string; dueInDays: number | null; phase: string }> }>(
        {
          schema: SuggestionSchema,
          system: "You are a pragmatic startup growth operations lead. Prefer small, testable tasks over vague strategy advice.",
          prompt,
        },
        "GROWTH_EXPERIMENT_TASKS",
      );

      return NextResponse.json({ data: { experimentId, suggestions: result.object.tasks } });
    } catch (error) {
      await refundAICredit(session.user.id);
      throw error;
    }
  } catch (error) {
    console.error("[GROWTH_EXPERIMENT_SUGGEST_TASKS_POST]", error);
    return NextResponse.json({ error: "Unable to generate execution tasks right now." }, { status: 500 });
  }
}
