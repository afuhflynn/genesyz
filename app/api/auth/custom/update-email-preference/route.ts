import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";

export async function PUT(req: NextRequest) {
  const { emailNotifications } = await req.json();
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
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { emailNotifications },
    });

    // Send notification email
    await sendEmail({
      to: updatedUser.email,
      subject: "Email preferences updated",
      html: `
        <p>Hi ${updatedUser.name || "there"},</p>
        <p>Your email notification preferences have been updated to: <strong>${
          emailNotifications ? "Enabled" : "Disabled"
        }</strong>.</p>
      `,
      text: `Hi ${
        updatedUser.name || "there"
      }, your email notification preferences have been updated.`,
    });

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: "Email preferences updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update email preference error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
