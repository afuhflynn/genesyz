import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_startups",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cohorts = await db.cohort.findMany({
    where: { acceleratorId },
    include: {
      _count: { select: { startups: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ data: cohorts });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_cohorts",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, startDate, endDate } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Name, start date, and end date are required" },
      { status: 400 },
    );
  }

  const cohort = await db.cohort.create({
    data: {
      acceleratorId,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json({ data: cohort }, { status: 201 });
}
