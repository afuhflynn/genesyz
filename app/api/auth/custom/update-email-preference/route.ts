import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/actions/getSeverSession";
import { sendNotificationEmail } from "@/utils/send.emails";
import { getUserByEmailAndId } from "@/lib/db-utils";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function PUT(req: NextRequest) {
  const { emailNotifications } = await req.json();
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
      session.user.id
    );

    if (!foundUser)
      return NextResponse.json(
        {
          success: false,
          message: "User session has expired or is invalid!",
        },
        { status: 403 }
      );

    // Delete current user, clear cookies and send emails
    const updatedUser = await prisma.user.update({
      where: {
        email: foundUser.email as string,
        id: foundUser.id as string,
      },
      data: {
        emailNotifications,
      },
    });

    if (!updatedUser) {
      await sendNotificationEmail(
        `We noticed an unsuccessful account email preferences update for your account with email: ${foundUser.email}`,
        foundUser?.email as string,
        foundUser?.name as string,
        new Date(Date.now()).toLocaleDateString(),
        foundUser?.name as string,
        {
          "X-Category": "Notification Email",
        }
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Sorry, an unexpected error occurred updating your email preferences",
        },
        { status: 500 }
      );
    }

    // Send the user a notification email
    await sendNotificationEmail(
      `Your email: ${updatedUser.email} recently authorized an update of your account email preferences`,
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
        user: { ...foundUser },
        success: true,
        message: "User account email preferences updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Error updating your account at moment. Please try again later.",
      },
      { status: 500 }
    );
  }
}
