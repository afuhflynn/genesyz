import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email/client";
import { validateUsername } from "@/utils/validate-username";

export async function PUT(req: NextRequest) {
  const { email, image, name, username } = await req.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if username is valid
  if (username && !validateUsername(username)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid username format",
      },
      { status: 400 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if username is taken
    if (username && username !== user.username) {
      const existing = await db.user.findFirst({
        where: { username },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    // Check if email is taken
    if (email && email !== user.email) {
      const existing = await db.user.findUnique({
        where: { email },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Email is already taken" },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        email: email || user.email,
        image: image || user.image,
        name: name || user.name,
        username: username || user.username,
      },
    });

    // Send notification email
    await sendEmail({
      to: updatedUser.email,
      subject: "Your account details were updated",
      html: `
        <p>Hi ${updatedUser.name || "there"},</p>
        <p>This is a confirmation that your account details were recently updated.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
      text: `Hi ${
        updatedUser.name || "there"
      }, your account details were recently updated.`,
    });

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update details error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
