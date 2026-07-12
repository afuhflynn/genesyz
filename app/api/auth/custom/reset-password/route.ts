import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, token } = resetPasswordSchema.parse(body);

    const { status } = await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to reset password",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
