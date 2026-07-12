import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAllowedToCreateIdea } from "@/lib/polar/entitlements";
import { createStartupSchema } from "@/lib/validators/startup";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const [startups, total] = await Promise.all([
    db.startup.findMany({
      where: {
        isActive: true,
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        idea: {
          include: {
            scores: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
        weeklyUpdates: { orderBy: { weekStart: "desc" }, take: 1 },
        _count: { select: { weeklyUpdates: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.startup.count({
      where: {
        isActive: true,
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
    }),
  ]);

  return NextResponse.json({
    data: startups,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entitlementCheck = await isAllowedToCreateIdea(session.user.id);
  if (!entitlementCheck.allowed) {
    return NextResponse.json(
      { error: entitlementCheck.reason },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = createStartupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ideaId, locationContext, ...startupData } = parsed.data;

  if (ideaId) {
    const existingIdea = await db.idea.findFirst({
      where: { id: ideaId, userId: session.user.id },
    });

    if (!existingIdea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const existingStartup = await db.startup.findUnique({
      where: { ideaId },
    });

    if (existingStartup) {
      return NextResponse.json(
        { error: "This idea already has a startup profile" },
        { status: 400 },
      );
    }
  }

  const slugExists = await db.startup.findUnique({
    where: { slug: startupData.slug },
  });

  if (slugExists) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 400 },
    );
  }

  const startup = await db.startup.create({
    data: {
      ...startupData,
      locationContext: locationContext ?? undefined,
      ideaId: ideaId ?? undefined,
      userId: session.user.id,
    },
    include: {
      idea: true,
    },
  });

  if (ideaId) {
    await db.idea.update({
      where: { id: ideaId },
      data: { status: "CONVERTED" },
    });
  }

  const orgBaseSlug = `${startupData.slug}-org`;
  const orgSlugExists = await db.organization.findUnique({
    where: { slug: orgBaseSlug },
  });
  const orgSlug = orgSlugExists
    ? `${orgBaseSlug}-${startup.id.slice(0, 6)}`
    : orgBaseSlug;

  const org = await db.organization.create({
    data: {
      name: `${startupData.name}`,
      slug: orgSlug,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  });

  await db.startup.update({
    where: { id: startup.id },
    data: { organizationId: org.id },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.created",
      resource: "startup",
      resourceId: startup.id,
      metadata: { name: startup.name, slug: startup.slug, organizationId: org.id },
    },
  });

  return NextResponse.json(startup, { status: 201 });
}
