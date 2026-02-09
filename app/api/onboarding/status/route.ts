import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Check if user should see onboarding modal
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has any ideas
    const ideaCount = await db.idea.count({
      where: { userId: session.user.id },
    });

    // Show onboarding if user has no ideas
    const showOnboarding = ideaCount === 0;

    return NextResponse.json({
      showOnboarding,
      ideaCount,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 },
    );
  }
}
