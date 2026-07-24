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
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params;
  const access = await getAccess(id);
  if ("response" in access) return access.response;
  const existing = await db.growthEvent.findFirst({
    where: { id: eventId, startupId: access.startupId },
    select: { id: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const body = await request.json();
  const event = await db.growthEvent.update({
    where: { id: eventId },
    data: {
      ...(body.eventName !== undefined
        ? { eventName: String(body.eventName).trim() }
        : {}),
      ...(body.stage !== undefined
        ? { stage: String(body.stage).toUpperCase() }
        : {}),
      ...(body.count !== undefined
        ? { count: Math.max(1, Math.floor(Number(body.count))) }
        : {}),
      ...(body.channel !== undefined ? { channel: body.channel } : {}),
      ...(body.value !== undefined
        ? { value: body.value === null ? null : Number(body.value) }
        : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.periodStart !== undefined
        ? { periodStart: body.periodStart ? new Date(body.periodStart) : null }
        : {}),
      ...(body.periodEnd !== undefined
        ? { periodEnd: body.periodEnd ? new Date(body.periodEnd) : null }
        : {}),
    },
  });
  return NextResponse.json({ data: event });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params;
  const access = await getAccess(id);
  if ("response" in access) return access.response;
  const existing = await db.growthEvent.findFirst({
    where: { id: eventId, startupId: access.startupId },
    select: { id: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  await db.growthEvent.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}
