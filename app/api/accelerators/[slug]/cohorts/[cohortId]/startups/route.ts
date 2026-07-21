import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; cohortId: string }> },
) {
  const { slug, cohortId } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_startups",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify cohort belongs to accelerator
  const cohort = await db.cohort.findFirst({
    where: { id: cohortId, acceleratorId },
  });

  if (!cohort) {
    return NextResponse.json(
      { error: "Cohort not found in this accelerator" },
      { status: 404 },
    );
  }

  const startups = await db.cohortStartup.findMany({
    where: { cohortId },
    include: {
      startup: {
        include: {
          user: { select: { name: true, email: true } },
          weeklyUpdates: {
            orderBy: { weekNumber: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json({ data: startups });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; cohortId: string }> },
) {
  const { slug, cohortId } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_startups",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify cohort belongs to accelerator
  const cohort = await db.cohort.findFirst({
    where: { id: cohortId, acceleratorId },
  });

  if (!cohort) {
    return NextResponse.json(
      { error: "Cohort not found in this accelerator" },
      { status: 404 },
    );
  }

  const body = await request.json();
  const { startupId } = body;

  if (!startupId) {
    return NextResponse.json(
      { error: "Startup ID is required" },
      { status: 400 },
    );
  }

  // Check if already in cohort
  const existing = await db.cohortStartup.findUnique({
    where: {
      cohortId_startupId: {
        cohortId,
        startupId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Startup already in cohort" },
      { status: 400 },
    );
  }

  const cohortStartup = await db.cohortStartup.create({
    data: {
      cohortId,
      startupId,
    },
  });

  return NextResponse.json({ data: cohortStartup }, { status: 201 });
}
