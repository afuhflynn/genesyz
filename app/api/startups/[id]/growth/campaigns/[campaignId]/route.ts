import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

async function getAccess(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const access = await checkStartupAccess(id, "edit_startup");
  if (!access.hasAccess || !access.startupId)
    return {
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  try {
    const user = await auth.api.getSession({ headers: await headers() });
    if (!user?.user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    await checkWorkspaceCapability(user.user.id, "growthOS", access.startupId);
  } catch (error) {
    const response = entitlementErrorResponse(error);
    if (response) return { response };
    throw error;
  }
  return { startupId: access.startupId };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> },
) {
  const { id, campaignId } = await params;
  const access = await getAccess(id);
  if ("response" in access) return access.response;
  const existing = await db.growthCampaign.findFirst({
    where: { id: campaignId, startupId: access.startupId },
    select: { id: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  const body = await request.json();
  const personaIds = Array.isArray(body.personaIds)
    ? body.personaIds.filter(
        (value: unknown): value is string => typeof value === "string",
      )
    : undefined;
  const campaign = await db.growthCampaign.update({
    where: { id: campaignId },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.channel !== undefined ? { channel: String(body.channel) } : {}),
      ...(body.objective !== undefined ? { objective: body.objective } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.budget !== undefined ? { budget: Number(body.budget) } : {}),
      ...(body.startDate !== undefined
        ? { startDate: body.startDate ? new Date(body.startDate) : null }
        : {}),
      ...(body.endDate !== undefined
        ? { endDate: body.endDate ? new Date(body.endDate) : null }
        : {}),
      ...(personaIds
        ? {
            personas: {
              deleteMany: {},
              create: personaIds.map((personaId: string) => ({ personaId })),
            },
          }
        : {}),
    },
    include: {
      personas: { include: { persona: true } },
      experiments: true,
      events: true,
    },
  });
  return NextResponse.json({ data: campaign });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> },
) {
  const { id, campaignId } = await params;
  const access = await getAccess(id);
  if ("response" in access) return access.response;
  const existing = await db.growthCampaign.findFirst({
    where: { id: campaignId, startupId: access.startupId },
    select: { id: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  await db.growthCampaign.update({
    where: { id: campaignId },
    data: { status: "ARCHIVED" },
  });
  return NextResponse.json({ success: true });
}
