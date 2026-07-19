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

    // Fetch user preferences and idea count in parallel
    const [user, ideaCount] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { onboardingDismissed: true },
      }),
      db.idea.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Show onboarding if user has no ideas and has not dismissed onboarding
    const showOnboarding = ideaCount === 0 && !user?.onboardingDismissed;

    return NextResponse.json({
      showOnboarding,
      ideaCount,
      onboardingDismissed: user?.onboardingDismissed ?? false,
    });
  } catch (error) {
    console.error("Onboarding status GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 },
    );
  }
}

// Persist onboarding dismissed/completed status
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set onboardingDismissed to true in database
    await db.user.update({
      where: { id: session.user.id },
      data: { onboardingDismissed: true },
    });

    console.log(`[ONBOARDING] Dismissed for user: ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding status POST error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 },
    );
  }
}
