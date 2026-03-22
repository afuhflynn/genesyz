import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalId } = await params;

    const goal = await db.weeklyGoal.findUnique({
      where: { id: goalId },
      include: {
        weeklyUpdate: {
          select: {
            startupId: true,
            startup: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Verify the user owns the startup
    if (goal.weeklyUpdate.startup.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.weeklyGoal.update({
      where: { id: goalId },
      data: { completed: !goal.completed },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error toggling goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
