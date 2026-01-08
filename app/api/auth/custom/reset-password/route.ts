import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * @description A function that handles user password reset
 * @param req
 * @returns
 */

export async function PUT(req: NextRequest) {
  const { password, token } = await req.json();
  try {
    //Ensure all fields are filled
    if (!token || !password)
      return NextResponse.json(
        { success: false, message: "All fields are required!" },
        { status: 400 }
      );
    //Check if user code is still valid
    const currentDate = new Date(Date.now());
    const foundUser = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: { gt: currentDate },
      },
    });
    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired password reset link.",
        },
        { status: 403 }
      );

    // call betterauth password reset api
    const { status } = await auth.api.resetPassword({
      body: {
        newPassword: password,
      },
      // We pass headers to ensure internal hooks work if needed
      headers: await headers(),
    });

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Error resetting your password. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Update db record
    await prisma.user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    });

    // Send welcome email
    // await emailService.sendNotificationEmail(
    //   `Your email: ${foundUser.email} recently requested for a password reset link.`,
    //   foundUser?.email as string,
    //   (foundUser?.name as string) || foundUser?.username || "User",
    //   new Date(Date.now()).toLocaleDateString(),
    //   foundUser?.name as string,
    //   {
    //     "X-Category": "Notification Email",
    //   }
    // );

    return NextResponse.json(
      {
        success: true,

        message: "User password reset successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      {
        success: false,
        message: "Error resetting your password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
