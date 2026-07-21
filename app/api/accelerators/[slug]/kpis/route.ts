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

  const kpis = await db.acceleratorKPI.findMany({
    where: { acceleratorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: kpis });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_kpis",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, targetValue, unit, deadline } = body;

  if (!name || !targetValue) {
    return NextResponse.json(
      { error: "Name and target value are required" },
      { status: 400 },
    );
  }

  const kpi = await db.acceleratorKPI.create({
    data: {
      acceleratorId,
      name,
      targetValue: parseFloat(targetValue),
      unit,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json({ data: kpi }, { status: 201 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_kpis",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, currentValue } = body;

  const parsedValue = parseFloat(currentValue);
  if (isNaN(parsedValue)) {
    return NextResponse.json(
      { error: "Invalid numeric value" },
      { status: 400 },
    );
  }

  const kpi = await db.acceleratorKPI.update({
    where: { id, acceleratorId },
    data: { currentValue: parsedValue },
  });

  return NextResponse.json({ data: kpi });
}
