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
    "view_metrics",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await db.acceleratorWeeklyReport.findMany({
    where: { acceleratorId },
    orderBy: { weekNumber: "desc" },
  });

  return NextResponse.json({ data: reports });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "submit_reports",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { weekNumber, content, metrics } = body;

  if (!weekNumber || !content) {
    return NextResponse.json(
      { error: "Week number and content are required" },
      { status: 400 },
    );
  }

  const report = await db.acceleratorWeeklyReport.create({
    data: {
      acceleratorId,
      weekNumber: parseInt(weekNumber),
      content,
      metrics,
      aiSummary:
        "AI-generated summary based on the report content would be synthesized here.",
    },
  });

  return NextResponse.json({ data: report }, { status: 201 });
}
