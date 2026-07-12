import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { updateStartupSchema } from "@/lib/validators/startup";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findFirst({
    where: {
      id: access.startupId,
    },
    include: {
      idea: {
        include: {
          inputs: true,
          scores: { orderBy: { createdAt: "desc" }, take: 1 },
          researchPackets: true,
        },
      },
      weeklyUpdates: {
        orderBy: { weekStart: "desc" },
        take: 8,
        include: { goals: true },
      },
      goals: { orderBy: { createdAt: "desc" } },
      metrics: true,
      _count: { select: { weeklyUpdates: true } },
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  return NextResponse.json(startup);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateStartupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const access = await checkStartupAccess(id, "edit_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const existingStartup = await db.startup.findFirst({
    where: { id: access.startupId },
  });

  if (!existingStartup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  if (parsed.data.slug && parsed.data.slug !== existingStartup.slug) {
    const slugExists = await db.startup.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 400 },
      );
    }
  }

  const startup = await db.startup.update({
    where: { id: existingStartup.id },
    data: parsed.data,
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.updated",
      resource: "startup",
      resourceId: startup.id,
      metadata: { updatedFields: Object.keys(parsed.data) },
    },
  });

  return NextResponse.json(startup);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "delete_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findFirst({
    where: { id: access.startupId },
    include: {
      _count: { select: { weeklyUpdates: true } },
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  await db.startup.delete({
    where: { id: startup.id },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.deleted",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        name: startup.name,
        slug: startup.slug,
        weeklyUpdatesCount: startup._count.weeklyUpdates,
      },
    },
  });

  return NextResponse.json({ success: true });
}
