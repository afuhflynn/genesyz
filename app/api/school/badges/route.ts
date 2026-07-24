import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const userBadges = await db.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({ data: userBadges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 },
    );
  }
}
