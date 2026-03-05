import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

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

  // Pagination validation
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  // Filter validation
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Validate type against enum if provided
  const validTypes = ["IDEA_RESEARCH", "WEEKLY_REPORT", "WEEKLY_DIGEST", "WEEKLY_REMINDER"];
  if (type && type !== "all" && !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid feed type" }, { status: 400 });
  }

  // Validate dates if provided
  if (dateFrom && isNaN(Date.parse(dateFrom))) {
    return NextResponse.json({ error: "Invalid dateFrom format" }, { status: 400 });
  }
  if (dateTo && isNaN(Date.parse(dateTo))) {
    return NextResponse.json({ error: "Invalid dateTo format" }, { status: 400 });
  }

  const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const skip = (page - 1) * limit;

  const where: any = {
    startupId: access.startupId,
  };

  if (type && type !== "all") {
    where.type = type;
  }

  if (dateFrom) {
    where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
  }

  if (dateTo) {
    where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
  }

  const [items, total] = await Promise.all([
    db.researchFeedItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        idea: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    db.researchFeedItem.count({ where }),
  ]);

  return NextResponse.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
