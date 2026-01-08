import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  try {
    //Ensure all fields are filled
    if (!token)
      return NextResponse.json(
        { success: false, message: "All fields are required!" },
        { status: 400 }
      );
    //Check if user token is still valid
    const currentDate = new Date(Date.now());
    const foundUser = await prisma.user.findFirst({
      where: {
        verificationToken: String(token),
        verificationTokenExpiresAt: { gt: currentDate },
      },
    });
    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token.",
        },
        { status: 403 }
      ); // send welcome email in background
    const updatedUser = await prisma.user.update({
      where: {
        email: foundUser.email,
      },
      data: {
        verificationCode: null,
        verificationCodeExpiresAt: null,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        emailVerified: true,
      },
    });

    if (!updatedUser) {
      return {
        message: `Error updating user account!`,
        updatedUser: null,
      };
    }
    // send welcome email in background
    await inngest.send({
      name: "email/send.welcomeEmail",
      data: {
        email: updatedUser.email,
      },
    });

    return NextResponse.json(
      {
        success: true,

        message: "Account verification successful",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying your email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
