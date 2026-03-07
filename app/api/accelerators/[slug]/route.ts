import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const accelerator = await db.accelerator.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, image: true, email: true } },
      members: {
        where: session?.user ? { userId: session.user.id } : { userId: "none" },
        select: { role: true },
      },
      cohorts: {
        where: { isActive: true },
        include: {
          _count: { select: { startups: true } },
        },
        orderBy: { startDate: "desc" },
      },
      _count: { select: { applications: true, cohorts: true } },
    },
  });

  if (!accelerator) {
    return NextResponse.json(
      { error: "Accelerator not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: accelerator });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_accelerator",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const updated = await db.accelerator.update({
    where: { id: acceleratorId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.programType && { programType: body.programType }),
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.website !== undefined && { website: body.website }),
      ...(body.contactEmail !== undefined && {
        contactEmail: body.contactEmail,
      }),
      ...(body.durationWeeks && { durationWeeks: body.durationWeeks }),
      ...(body.benefits !== undefined && { benefits: body.benefits }),
      ...(body.requirements !== undefined && {
        requirements: body.requirements,
      }),
      ...(body.maxStartups && { maxStartups: body.maxStartups }),
      ...(body.fundingAmount !== undefined && {
        fundingAmount: body.fundingAmount,
      }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_accelerator",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.accelerator.update({
    where: { id: acceleratorId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}

