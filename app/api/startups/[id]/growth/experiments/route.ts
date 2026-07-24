import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

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

    const campaigns = await db.growthCampaign.findMany({
      where: { startupId: access.startupId },
      include: { experiments: true },
      orderBy: { createdAt: "desc" },
    });

    const experiments = await db.growthExperiment.findMany({
      where: { startupId: access.startupId },
      include: {
        campaign: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            deadline: true,
            experimentId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const experimentsWithProgress = experiments.map((experiment) => {
      const completed = experiment.tasks.filter(
        (task) => task.status === "DONE",
      ).length;
      const overdue = experiment.tasks.filter(
        (task) =>
          task.status !== "DONE" &&
          task.deadline &&
          task.deadline.getTime() < Date.now(),
      ).length;
      return {
        ...experiment,
        progress: {
          total: experiment.tasks.length,
          completed,
          overdue,
          percent: experiment.tasks.length
            ? Math.round((completed / experiment.tasks.length) * 100)
            : 0,
        },
      };
    });

    return NextResponse.json({
      data: { campaigns, experiments: experimentsWithProgress },
    });
  } catch (error) {
    console.error("[EXPERIMENTS_GET]", error);
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
      type,
      name,
      channel,
      budget,
      campaignId,
      title,
      hypothesis,
      metrics,
      results,
      conclusion,
      status,
      learnings,
      personaIds,
    } = body;

    // Create Campaign
    if (type === "campaign") {
      if (!name || !channel) {
        return NextResponse.json(
          { error: "Missing campaign name or channel" },
          { status: 400 },
        );
      }

      const campaign = await db.growthCampaign.create({
        data: {
          startupId: access.startupId,
          name,
          channel,
          budget: typeof budget === "number" ? budget : 0,
        },
      });

      return NextResponse.json({ data: campaign }, { status: 201 });
    }

    // Create Experiment
    if (type === "experiment") {
      if (!title || !hypothesis || !metrics) {
        return NextResponse.json(
          { error: "Missing experiment parameters" },
          { status: 400 },
        );
      }

      const experiment = await db.growthExperiment.create({
        data: {
          startupId: access.startupId,
          campaignId: campaignId
            ? ((
                await db.growthCampaign.findFirst({
                  where: { id: campaignId, startupId: access.startupId },
                  select: { id: true },
                })
              )?.id ?? null)
            : null,
          title,
          hypothesis,
          metrics,
          results: results || "",
          status: status || "PLANNED",
          conclusion: conclusion || "PENDING",
          learnings: learnings || "",
          personas: Array.isArray(personaIds)
            ? { create: personaIds.map((personaId: string) => ({ personaId })) }
            : undefined,
        },
        include: { personas: { include: { persona: true } } },
      });

      return NextResponse.json({ data: experiment }, { status: 201 });
    }

    // Update Experiment
    if (type === "update_experiment") {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { error: "Missing experiment ID" },
          { status: 400 },
        );
      }

      const existing = await db.growthExperiment.findFirst({
        where: { id, startupId: access.startupId },
        select: { id: true },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Experiment not found" },
          { status: 404 },
        );
      }

      const updated = await db.growthExperiment.update({
        where: { id: existing.id },
        data: {
          results,
          conclusion,
          status,
          learnings,
        },
      });

      return NextResponse.json({ data: updated });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[EXPERIMENTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
