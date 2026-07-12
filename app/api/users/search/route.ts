import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const excludeStartupId = searchParams.get("excludeStartup");

  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  let whereClause: Record<string, unknown> = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ],
    NOT: {
      id: session.user.id,
    },
  };

  if (excludeStartupId) {
    const startup = await db.startup.findFirst({
      where: {
        OR: [{ slug: excludeStartupId }, { id: excludeStartupId }],
      },
      select: { id: true, userId: true },
    });

    if (startup) {
      const existingMembers = await db.startupMember.findMany({
        where: { startupId: startup.id },
        select: { userId: true },
      });

      const excludeUserIds = [
        startup.userId,
        ...existingMembers.map((m) => m.userId),
      ];

      whereClause = {
        ...whereClause,
        NOT: {
          id: { in: excludeUserIds },
        },
      };
    }
  }

  const users = await db.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: users });
}
