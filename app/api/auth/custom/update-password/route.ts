import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/actions/getSeverSession";
import { hashPassword } from "@/utils/hash-password";
import { sendNotificationEmail } from "@/utils/send.emails";
import bcrypt from "bcryptjs";
import { getUserByEmailAndId } from "@/lib/db-utils";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function PUT(req: NextRequest) {
  const { password, currentPassword } = await req.json();
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "User session expired or invalid",
      },
      { status: 400 }
    );
  }

  try {
    //Check if user code is still valid
    const foundUser = await getUserByEmailAndId(
      session.user.email as string,
      session.user.id as string
    );

    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "User session has expired or is invalid!",
        },
        { status: 403 }
      );

    // Check if current password matches the provided current password
    const match = await bcrypt.compare(
      currentPassword,
      foundUser.password as string
    );
    if (!match)
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect current password.",
        },
        { status: 403 }
      );

    // hash provided password
    const pwdHash = await hashPassword(password);

    // Update db record
    const updatedUser = await prisma.user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        password: password ? pwdHash : foundUser.password,
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Sorry, an unexpected error occurred updating your password",
        },
        { status: 500 }
      );
    }

    // Send the user a notification email
    await sendNotificationEmail(
      `Your email: ${updatedUser.email} recently authorized an update of your account password`,
      updatedUser?.email as string,
      (updatedUser?.name as string) || (foundUser?.username as string),
      new Date(Date.now()).toLocaleDateString(),
      updatedUser?.name as string,
      {
        "X-Category": "Notification Email",
      }
    );

    return NextResponse.json(
      {
        success: true,
        user: { ...updatedUser },
        message: "User password updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating your password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
