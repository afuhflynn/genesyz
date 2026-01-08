import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const { password, token } = await req.json();

  try {
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Better Auth handles the token validation and password update
    const { status, error } = await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });

    if (error || !status) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message || "Failed to reset password",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
