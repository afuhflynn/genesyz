import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlement, activeIdeas] = await db.$transaction([
      db.entitlement.findUnique({
        where: { userId: session.user.id },
      }),
      db.idea.count({
        where: {
          userId: session.user.id,
          isArchived: false,
        },
      }),
    ]);

    if (!entitlement) {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }

    const data = {
      subscription: entitlement.plan,
      usage: {
        activeIdeas: activeIdeas || 0,
        maxIdeas: entitlement.maxActiveIdeas,
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
