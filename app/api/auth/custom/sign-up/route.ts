import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode } from "@/utils/generateCode";
import { generateToken } from "@/utils/generate-token";
import { inngest } from "@/inngest/client";
import { generateUniqueUsername } from "@/utils/generate-unique-username";

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

    // Ensure user record exists from pre-auth stage
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser)
      return NextResponse.json(
        {
          success: false,
          message: "Sorry, an unexpected error occurred signing up.",
        },
        { status: 409 }
      );

    // Generate a guaranteed unique username
    const uniqueUsername = await generateUniqueUsername();

    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();

    // use background job to do the remaining work
    await inngest.send({
      name: "email/send.verificationEmail",
      data: {
        email,
        username: `${existingUser.name} @${uniqueUsername}`,
        verificationToken,
        verificationCode,
      },
    });

    return NextResponse.json(
      { success: true, message: "Signup successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred on our side signing you up. Please try again later.",
      },
      { status: 500 }
    );
  }
}
