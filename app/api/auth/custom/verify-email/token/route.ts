import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { verifyEmailTokenSchema } from "@/lib/validators/auth";

/**
 * @description Handles email verification via token.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verifyEmailTokenSchema.parse(body);

    const foundUser = await db.user.findFirst({
      where: {
        verificationCode: token,
        verificationExpiry: { gte: new Date() },
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
        verificationExpiry: null,
      },
    });

    // Send welcome email via Inngest
    await inngest.send({
      name: "email.send.welcome",
      data: {
        email: updatedUser.email,
        name: updatedUser.name,
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
