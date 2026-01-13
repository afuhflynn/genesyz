import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";

export async function PUT(req: NextRequest) {
  const { password, currentPassword } = await req.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if current password matches
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Incorrect current password" },
        { status: 400 },
      );
    }

    // Hash new password
    const pwdHash = await hashPassword(password);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: pwdHash },
    });

    // Send notification email
    await sendEmail({
      to: user.email,
      subject: "Your password was updated",
      html: `
        <p>Hi ${user.name || "there"},</p>
        <p>This is a confirmation that your password was recently changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
      text: `Hi ${user.name || "there"}, your password was recently changed.`,
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
