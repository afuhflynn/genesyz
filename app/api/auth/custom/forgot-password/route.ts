import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Better Auth handles token generation and storage
    // We just need to trigger the request and send the email
    // However, Better Auth's forgotPassword usually sends the email automatically if configured
    // But since we want more control, we can use the internal API to get the token/url

    const { status } = await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process request",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists, a reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
