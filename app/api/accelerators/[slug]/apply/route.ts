import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();

  const accelerator = await db.accelerator.findUnique({
    where: { slug },
  });

  if (!accelerator) {
    return NextResponse.json(
      { error: "Accelerator not found" },
      { status: 404 },
    );
  }

  if (!accelerator.isPublic || !accelerator.isActive) {
    return NextResponse.json(
      { error: "Accelerator not available" },
      { status: 404 },
    );
  }

  const existingApplication = await db.acceleratorApplication.findFirst({
    where: {
      acceleratorId: accelerator.id,
      founderEmail: body.founderEmail,
    },
  });

  if (existingApplication) {
    return NextResponse.json(
      { error: "You have already applied to this accelerator" },
      { status: 400 },
    );
  }

  let startupId = null;
  if (body.startupId) {
    const startup = await db.startup.findFirst({
      where: {
        id: body.startupId,
        userId: session.user.id,
      },
    });
    if (startup) {
      startupId = startup.id;
    }
  }

  const application = await db.acceleratorApplication.create({
    data: {
      acceleratorId: accelerator.id,
      startupId,
      founderEmail: body.founderEmail,
      founderName: body.founderName,
      founderPhone: body.founderPhone || null,
      answers: body.answers || null,
      status: "pending",
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "accelerator.application.created",
      resource: "acceleratorApplication",
      resourceId: application.id,
    },
  });

  return NextResponse.json(application, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const accelerator = await db.accelerator.findUnique({
    where: { slug },
  });

  if (!accelerator) {
    return NextResponse.json(
      { error: "Accelerator not found" },
      { status: 404 },
    );
  }

  if (accelerator.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const applications = await db.acceleratorApplication.findMany({
    where: { acceleratorId: accelerator.id },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({ data: applications });
}
