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
  const category = searchParams.get("category");
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

  const opportunities = await db.startupOpportunity.findMany({
    where: {
      startupId: startup.id,
      ...(category && { category: category as any }),
      ...(status && { status: status as any }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: opportunities });
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

  const opportunity = await db.startupOpportunity.create({
    data: {
      startupId: startup.id,
      title: body.title,
      description: body.description,
      url: body.url,
      category: body.category,
      eligibility: body.eligibility,
      benefits: body.benefits,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status || "DISCOVERED",
      source: "manual",
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "opportunity.created",
      resource: "startup_opportunity",
      resourceId: opportunity.id,
      metadata: { startupId: startup.id },
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
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
  const { opportunityId, ...updateData } = body;

  if (!opportunityId) {
    return NextResponse.json(
      { error: "Opportunity ID is required" },
      { status: 400 },
    );
  }

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const existing = await db.startupOpportunity.findFirst({
    where: { id: opportunityId, startupId: startup.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 },
    );
  }

  const updated = await db.startupOpportunity.update({
    where: { id: opportunityId },
    data: {
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.notes !== undefined && { notes: updateData.notes }),
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.description && { description: updateData.description }),
    },
  });

  return NextResponse.json(updated);
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
  const opportunityId = searchParams.get("opportunityId");

  if (!opportunityId) {
    return NextResponse.json(
      { error: "Opportunity ID is required" },
      { status: 400 },
    );
  }

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  await db.startupOpportunity.delete({
    where: { id: opportunityId },
  });

  return NextResponse.json({ success: true });
}
