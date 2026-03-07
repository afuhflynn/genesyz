import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_startups", // Basic view access
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cohortId = searchParams.get("cohortId");

  const events = await db.acceleratorEvent.findMany({
    where: { 
      acceleratorId,
      ...(cohortId && { cohortId }),
    },
    include: {
      cohort: { select: { name: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ data: events });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_events",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, eventType, scheduledAt, duration, location, meetingUrl, cohortId } = body;

  if (!title || !eventType || !scheduledAt || !duration) {
    return NextResponse.json(
      { error: "Title, type, date, and duration are required" },
      { status: 400 },
    );
  }

  const event = await db.acceleratorEvent.create({
    data: {
      acceleratorId,
      title,
      description,
      eventType,
      scheduledAt: new Date(scheduledAt),
      duration: parseInt(duration),
      location,
      meetingUrl,
      cohortId: cohortId === "all" ? null : cohortId,
    },
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
