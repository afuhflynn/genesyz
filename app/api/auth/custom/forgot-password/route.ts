import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/utils/generate-token";
import { getUserByEmail } from "@/lib/db-utils";
import { emailService } from "@/utils/send.emails";
import { auth } from "@/lib/auth";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  try {
    //Ensure all fields are filled
    if (!email)
      return NextResponse.json(
        { success: false, message: "All fields are required!" },
        { status: 400 }
      );
    //Check if user code is still valid
    const foundUser = await getUserByEmail(email);
    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "User not found!",
        },
        { status: 403 }
      );

    const { status } = await auth.api.requestPasswordReset({
      body: {
        email,
      },
    });

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Error sending reset email. Please try again later.",
        },
        { status: 500 }
      );
    }
    // Update db record
    // const resetToken = generateToken();
    // await prisma.user.update({
    //   where: {
    //     id: foundUser.id,
    //   },
    //   data: {
    //     resetPasswordToken: resetToken,
    //     resetPasswordTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    //   },
    // });

    // // Send the user a notification email
    // await emailService.sendPasswordResetEmail(
    //   foundUser.email as string,
    //   (foundUser.name as string) || foundUser.username || "User",
    //   `${process.env.NEXT_PUBLIC_CLIENT_URL}/reset-password/${resetToken}`,
    //   {
    //     "X-Category": "Password Reset",
    //   }
    // );

    return NextResponse.json(
      {
        success: true,
        message: "Password reset email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      {
        success: false,
        message: "Error sending reset email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
