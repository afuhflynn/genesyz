import ip from "@arcjet/ip";
import { type NextRequest, NextResponse } from "next/server";
import { generateVerificationCode } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { ajAuth, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { sendVerificationEmail } from "@/lib/email/send";
import { resendVerificationSchema } from "@/lib/validators/auth";

export async function PUT(req: NextRequest) {
  try {
    const decision = await checkRateLimit(req, ip(req) || "127.0.0.1", ajAuth);
    if (decision) return rateLimitResponse(decision);

    const body = await req.json();
    const { email } = resendVerificationSchema.parse(body);

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

    await db.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // URL points to the code-entry page — users type the 6-digit code there.
    // No token is embedded in the URL because the code itself is the credential.
    await sendVerificationEmail({
      to: email,
      userName: user.name,
      code: verificationCode,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
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
