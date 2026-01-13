import { type NextRequest, NextResponse } from "next/server";
import { generateToken, generateVerificationCode } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

export async function PUT(req: NextRequest) {
  const { email } = await req.json();

  try {
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 },
      );
    }

    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();

    // Update user with new verification code
    await db.user.update({
      where: { email },
      data: {
        verificationCode,
      },
    });

    // Send verification email via Inngest
    await inngest.send({
      name: "email.send.verification",
      data: {
        email,
        name: user.name,
        code: verificationCode,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
      },
    });

    return NextResponse.json(
      { success: true, message: "Verification email resent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
