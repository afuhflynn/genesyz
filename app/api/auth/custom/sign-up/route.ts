import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateVerificationCode,
  generateToken,
  generateUniqueUsername,
} from "@/lib/auth-utils";
import { inngest } from "@/lib/inngest/client";

/**
 * @description Handles user signup, ensures a unique username is auto-generated,
 * and sends a verification email.
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    // Validate input
    if (!email)
      return NextResponse.json(
        { success: false, message: "Email is required!" },
        { status: 400 }
      );

    // Ensure user record exists
    const existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser)
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );

    // Generate a guaranteed unique username
    const uniqueUsername = generateUniqueUsername(existingUser.name);

    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();

    // Update user with username and verification info if needed
    await db.user.update({
      where: { email },
      data: {
        username: uniqueUsername,
        verificationCode,
      },
    });

    // Send verification email via Inngest
    await inngest.send({
      name: "email.send.verification",
      data: {
        email,
        name: existingUser.name,
        code: verificationCode,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
      },
    });

    return NextResponse.json(
      { success: true, message: "Signup processed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during signup processing.",
      },
      { status: 500 }
    );
  }
}
