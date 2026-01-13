import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

/**
 * @description Handles email verification via token.
 */
export async function POST(req: NextRequest) {
  const { token } = await req.json();

  try {
    if (!token)
      return NextResponse.json(
        { success: false, message: "Token is required!" },
        { status: 400 },
      );

    // We can use Better Auth's internal API to verify the email if it's a Better Auth token
    // For now, we'll refactor the custom logic to use 'db'

    const foundUser = await db.user.findFirst({
      where: {
        verificationCode: token, // Assuming token is stored in verificationCode or similar
      },
    });

    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token.",
        },
        { status: 403 },
      );

    const updatedUser = await db.user.update({
      where: { id: foundUser.id },
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
      {
        success: true,
        message: "Account verification successful",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying your email.",
      },
      { status: 500 },
    );
  }
}
