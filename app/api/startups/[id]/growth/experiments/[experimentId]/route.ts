import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

const UpdateExperimentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  hypothesis: z.string().trim().min(1).max(4000).optional(),
  metrics: z.string().trim().min(1).max(2000).optional(),
  campaignId: z.string().min(1).nullable().optional(),
  status: z.enum(["PLANNED", "RUNNING", "CONCLUDED"]).optional(),
  results: z.string().max(8000).optional(),
  conclusion: z
    .enum(["PENDING", "SUCCESS", "FAILURE", "INCONCLUSIVE"])
    .optional(),
  learnings: z.string().max(8000).optional(),
  personaIds: z.array(z.string()).max(50).optional(),
});

async function getExperimentDetail(experimentId: string, startupId: string) {
  const experiment = await db.growthExperiment.findFirst({
    where: { id: experimentId, startupId },
    include: {
      campaign: true,
      personas: { include: { persona: true } },
      tasks: {
        orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "asc" }],
        include: {
          assignees: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          labels: { include: { label: true } },
          milestone: true,
        },
      },
    },
  });
  if (!experiment) return null;
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: startupIdOrSlug, experimentId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");
    if (!access.hasAccess || !access.startupId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }
    const decision = await checkRateLimit(
      request,
      session.user.id,
      ajRateLimit,
    );
    if (decision) return rateLimitResponse(decision);
    const experiment = await getExperimentDetail(
      experimentId,
      access.startupId,
    );
    if (!experiment)
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 },
      );
    return NextResponse.json({ data: experiment });
  } catch (error) {
    console.error("[GROWTH_EXPERIMENT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: startupIdOrSlug, experimentId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "edit_startup");
    if (!access.hasAccess || !access.startupId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }
    const decision = await checkRateLimit(
      request,
      session.user.id,
      ajRateLimit,
    );
    if (decision) return rateLimitResponse(decision);
    const parsed = UpdateExperimentSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Invalid experiment payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    const existing = await db.growthExperiment.findFirst({
      where: { id: experimentId, startupId: access.startupId },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 },
      );
    if (parsed.data.campaignId) {
      const campaign = await db.growthCampaign.findFirst({
        where: { id: parsed.data.campaignId, startupId: access.startupId },
        select: { id: true },
      });
      if (!campaign)
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 400 },
        );
    }
    const { personaIds, ...experimentData } = parsed.data;
    if (personaIds) {
      const valid = await db.customerPersona.count({
        where: { startupId: access.startupId, id: { in: personaIds } },
      });
      if (valid !== personaIds.length)
        return NextResponse.json(
          { error: "One or more personas were not found" },
          { status: 400 },
        );
    }
    await db.growthExperiment.update({
      where: { id: existing.id },
      data: {
        ...experimentData,
        ...(personaIds
          ? {
              personas: {
                deleteMany: {},
                create: personaIds.map((personaId) => ({ personaId })),
              },
            }
          : {}),
      },
    });
    const experiment = await getExperimentDetail(existing.id, access.startupId);
    return NextResponse.json({ data: experiment });
  } catch (error) {
    console.error("[GROWTH_EXPERIMENT_PATCH]", error);
    return NextResponse.json(
      { error: "Unable to update experiment." },
      { status: 500 },
    );
  }
}
