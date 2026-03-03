import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const applications = await db.application.findMany({
    where: {
      startupId: startup.id,
      ...(status && { status: status as any }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ data: applications });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const body = await request.json();

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const application = await db.application.create({
    data: {
      startupId: startup.id,
      title: body.title,
      description: body.description || null,
      url: body.url || null,
      organization: body.organization || null,
      type: body.type || "GRANT",
      status: "TO_APPLY",
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json(application, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const body = await request.json();
  const { applicationId, ...updateData } = body;

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const application = await db.application.update({
    where: {
      id: applicationId,
      startupId: startup.id,
    },
    data: {
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.notes !== undefined && { notes: updateData.notes }),
      ...(updateData.appliedAt && {
        appliedAt: new Date(updateData.appliedAt),
      }),
    },
  });

  return NextResponse.json(application);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  await db.application.delete({
    where: {
      id: applicationId!,
      startupId: startup.id,
    },
  });

  return NextResponse.json({ success: true });
}
