import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { verifyEmailSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = verifyEmailSchema.parse(body);

    const user = await db.user.findFirst({
      where: {
        verificationCode: code,
        verificationExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        { status: 400 },
      );
    }

    // Update user as verified
    const updatedUser = await db.user.update({
      where: { id: user.id },
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
      { success: true, message: "Email verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
