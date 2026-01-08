import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode } from "@/utils/generateCode";
import { generateToken } from "@/utils/generate-token";
import { sendVerificationEmail } from "@/utils/send.emails";
import { getUserByEmail } from "@/lib/db-utils";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function PUT(req: NextRequest) {
  const { email } = await req.json();
  try {
    //Ensure all fields are filled
    if (!email)
      return NextResponse.json(
        { success: false, message: "All fields are required!" },
        { status: 400 }
      );
    //Check if user with given email exists
    const foundUser = await getUserByEmail(email);
    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 403 }
      );

    // NOTE: Prevent the user from requesting too many emails to verify account
    // const decision = aj.withRule([

    //   tokenBucket({
    //     mode: "LIVE",
    //     refillRate: 5, // Refill 5 tokens per interval
    //     interval: 10, // Refill every 10 seconds
    //     capacity: 10, // Bucket capacity of 10 tokens

    //   }),
    // ]);

    // Update db record
    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();
    const updatedUser = await db.user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        verificationCode,
        verificationCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        emailVerified: false,
      },
    });

    //Send verification email
    await sendVerificationEmail(
      updatedUser.verificationCode as string,
      updatedUser.email as string,
      (updatedUser.name as string) || foundUser.username || "User",
      updatedUser.verificationToken as string,
      {
        "X-Category": "Verification Email",
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Verification sent successful",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error sending email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
