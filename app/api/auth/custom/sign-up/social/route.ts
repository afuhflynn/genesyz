import { type NextRequest, NextResponse } from "next/server";
import { generateUniqueUsername } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

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
        { status: 400 },
      );

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

    let username = existingUser.username;

    // Check if user has a username field
    if (!username || username.trim() === "") {
      // Generate a guaranteed unique username
      username = generateUniqueUsername(existingUser.name);

      // update db record
      await db.user.update({
        where: { email },
        data: {
          username,
        },
      });
    }

    // Send welcome email via Inngest
    await inngest.send({
      name: "email.send.welcome",
      data: {
        email,
        name: existingUser.name,
      },
    });

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Social signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating your profile.",
      },
      { status: 500 },
    );
  }
}
