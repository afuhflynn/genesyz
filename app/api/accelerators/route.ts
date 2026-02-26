import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get("public") === "true";

  const session = await auth.api.getSession({ headers: await headers() });

  const accelerators = await db.accelerator.findMany({
    where: publicOnly
      ? { isPublic: true, isActive: true }
      : session?.user
        ? {
            OR: [{ isPublic: true }, { ownerId: session.user.id }],
            isActive: true,
          }
        : { isPublic: true, isActive: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { cohorts: true, applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: accelerators });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Generate slug from name
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check if slug exists
  const existing = await db.accelerator.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "An accelerator with this name already exists" },
      { status: 400 },
    );
  }

  const accelerator = await db.accelerator.create({
    data: {
      name: body.name,
      slug: `${slug}-${Date.now()}`,
      description: body.description,
      programType: body.programType || "accelerator",
      logoUrl: body.logoUrl,
      website: body.website,
      contactEmail: body.contactEmail,
      durationWeeks: body.durationWeeks,
      benefits: body.benefits,
      requirements: body.requirements,
      maxStartups: body.maxStartups,
      fundingAmount: body.fundingAmount,
      ownerId: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "accelerator.created",
      resource: "accelerator",
      resourceId: accelerator.id,
    },
  });

  return NextResponse.json(accelerator, { status: 201 });
}
