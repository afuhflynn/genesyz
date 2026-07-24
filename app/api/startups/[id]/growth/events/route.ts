import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildFunnelInsights } from "@/lib/growth/analytics";
import { GROWTH_CHANNELS, normalizeStage } from "@/lib/growth/constants";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

const eventSchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  stage: z.string().optional(),
  count: z.number().int().min(1).max(1_000_000).default(1),
  campaignId: z.string().min(1).nullable().optional(),
  experimentId: z.string().min(1).nullable().optional(),
  personaId: z.string().min(1).nullable().optional(),
  channel: z.string().trim().max(80).optional(),
  source: z.string().trim().max(120).optional(),
  medium: z.string().trim().max(120).optional(),
  campaign: z.string().trim().max(120).optional(),
  value: z.number().finite().optional(),
  occurredAt: z.string().datetime().optional(),
  periodStart: z.string().datetime().nullable().optional(),
  periodEnd: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).optional(),
});

async function accessFor(
  request: NextRequest,
  id: string,
  permission: "view_startup" | "edit_startup",
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const access = await checkStartupAccess(id, permission);
  if (!access.hasAccess || !access.startupId)
    return {
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  try {
    await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId);
  } catch (error) {
    const response = entitlementErrorResponse(error);
    if (response) return { response };
    throw error;
  }
  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return { response: rateLimitResponse(decision) };
  return { session, startupId: access.startupId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await accessFor(request, (await params).id, "view_startup");
  if ("response" in result) return result.response;
  const events = await db.growthEvent.findMany({
    where: { startupId: result.startupId },
    orderBy: { occurredAt: "desc" },
    take: 500,
  });
  const summary = Object.values(
    events.reduce<
      Record<string, { eventName: string; count: number; value: number }>
    >((acc, event) => {
      const current = acc[event.eventName] ?? {
        eventName: event.eventName,
        count: 0,
        value: 0,
      };
      current.count += event.count;
      current.value += event.value ?? 0;
      acc[event.eventName] = current;
      return acc;
    }, {}),
  );
  const funnel = buildFunnelInsights(events);
  const channelPerformance = Object.values(
    events.reduce<
      Record<string, { channel: string; count: number; value: number }>
    >((acc, event) => {
      const channel = event.channel || event.source || event.medium || "Unattributed";
      const current = acc[channel] ?? { channel, count: 0, value: 0 };
      current.count += event.count;
      current.value += event.value ?? 0;
      acc[channel] = current;
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);
  return NextResponse.json({
    data: {
      events,
      summary,
      funnel,
      channelPerformance,
      channels: GROWTH_CHANNELS,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await accessFor(request, (await params).id, "edit_startup");
  if ("response" in result) return result.response;
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid event", details: parsed.error.flatten() },
      { status: 400 },
    );
  const data = parsed.data;
  const ids = [data.campaignId, data.experimentId, data.personaId].filter(
    Boolean,
  ) as string[];
  if (ids.length) {
    const [campaign, experiment, persona] = await Promise.all([
      data.campaignId
        ? db.growthCampaign.findFirst({
            where: { id: data.campaignId, startupId: result.startupId },
            select: { id: true },
          })
        : null,
      data.experimentId
        ? db.growthExperiment.findFirst({
            where: { id: data.experimentId, startupId: result.startupId },
            select: { id: true },
          })
        : null,
      data.personaId
        ? db.customerPersona.findFirst({
            where: { id: data.personaId, startupId: result.startupId },
            select: { id: true },
          })
        : null,
    ]);
    if (
      (data.campaignId && !campaign) ||
      (data.experimentId && !experiment) ||
      (data.personaId && !persona)
    )
      return NextResponse.json(
        { error: "One or more linked GrowthOS records were not found" },
        { status: 404 },
      );
  }
  const event = await db.growthEvent.create({
    data: {
      startupId: result.startupId,
      campaignId: data.campaignId ?? null,
      experimentId: data.experimentId ?? null,
      personaId: data.personaId ?? null,
      eventName: data.eventName,
      stage: normalizeStage(data.stage),
      count: data.count,
      channel: data.channel,
      source: data.source,
      medium: data.medium,
      campaignName: data.campaign,
      value: data.value,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : undefined,
      periodStart: data.periodStart ? new Date(data.periodStart) : null,
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
      notes: data.notes,
    },
  });
  return NextResponse.json({ data: event }, { status: 201 });
}
