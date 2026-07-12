import { type NextRequest, NextResponse } from "next/server";
import {
  generateToken,
  generateUniqueUsername,
  generateVerificationCode,
} from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/send";
import { signUpSchema } from "@/lib/validators/auth";

/**
 * @description Handles user signup, ensures a unique username is auto-generated,
 * and sends a verification email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = signUpSchema.parse(body);

    // Ensure user record exists
    const existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser)
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );

    // Generate a guaranteed unique username
    const uniqueUsername = generateUniqueUsername(existingUser.name);

    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();

    // Update user with username and verification info
    await db.user.update({
      where: { email },
      data: {
        username: uniqueUsername,
        verificationCode,
        verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await sendVerificationEmail({
      to: email,
      userName: existingUser.name,
      code: verificationCode,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
    });

    return NextResponse.json(
      { success: true, message: "Signup processed successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during signup processing.",
      },
      { status: 500 },
    );
  }
}
