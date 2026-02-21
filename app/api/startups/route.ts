import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAllowedToCreateIdea } from "@/lib/polar/entitlements";
import { checkSlugSchema, createStartupSchema } from "@/lib/validators/startup";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [startups, total] = await Promise.all([
    db.startup.findMany({
      where: { userId: session.user.id, isActive: true },
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
      where: { userId: session.user.id, isActive: true },
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

  const { ideaId, ...startupData } = parsed.data;

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
      ideaId,
      userId: session.user.id,
    },
    include: {
      idea: true,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.created",
      resource: "startup",
      resourceId: startup.id,
      metadata: { name: startup.name, slug: startup.slug },
    },
  });

  return NextResponse.json(startup, { status: 201 });
}
