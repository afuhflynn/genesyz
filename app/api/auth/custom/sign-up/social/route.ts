import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { generateUniqueUsername } from "@/utils/generate-unique-username";

/**
 * @description Handles unique username generation after social auth signup or uses the available name, and sends a personalized welcome email.
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

    // Check if user has a username field
    if (!existingUser.username || existingUser.username.trim() === "") {
      // Generate a guaranteed unique username
      const uniqueUsername = await generateUniqueUsername();

      // update db record
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          username: uniqueUsername,
        },
      });

      if (!updatedUser) {
        return {
          message: `Error updating user account!`,
          updatedUser: null,
        };
      }
    }

    // Send welcome email with inngest background job
    await inngest.send({
      name: "email/send.welcomeEmail",
      data: {
        email,
      },
    });

    return NextResponse.json(
      { success: true, message: "Credentials updated successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred on our side updating your credentials. Please try again later.",
      },
      { status: 500 }
    );
  }
}
