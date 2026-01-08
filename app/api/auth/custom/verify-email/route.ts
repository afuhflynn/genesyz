import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  try {
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Verification code is required" },
        { status: 400 }
      );
    }

    // Manual verification logic
    const user = await db.user.findFirst({
      where: {
        verificationCode: code,
        // We could also check verificationExpiry here if we had it
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        { status: 400 }
      );
    }

    // Update user as verified
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
      },
    });

    // Send welcome email via Inngest
    await inngest.send({
      name: "email.send.welcome",
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username || updatedUser.email.split("@")[0],
      },
    });

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
