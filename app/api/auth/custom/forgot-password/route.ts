import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

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
