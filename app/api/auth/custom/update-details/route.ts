import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/actions/getSeverSession";
import { sendNotificationEmail } from "@/utils/send.emails";
import { validateUsername } from "@/utils/validate-username";
import {
  getUserByEmail,
  getUserByEmailAndId,
  getUserByUsername,
} from "@/lib/db-utils";

/**
 * @description A function that handles user sign up and account creation
 * @param req
 * @returns
 */

export async function PUT(req: NextRequest) {
  const { email, image, name, username } = await req.json();
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

  // Check if username is valid
  const isValidUsername = validateUsername(username);

  if (!isValidUsername) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Username must not include any white spaces or special characters (only numbers, letters underscores or dashes are allowed)",
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

    // Check if user already exists with provided new email or username
    if (foundUser.username !== username) {
      const userNameExists = await getUserByUsername(username as string);

      if (userNameExists)
        return NextResponse.json(
          {
            success: false,
            message: "The provided username is already taken!",
          },
          { status: 409 }
        );
    }

    // Check if user already exists with provided new email or username
    if (session?.user.email !== email) {
      const userEmailExists = await getUserByEmail(email as string);

      if (userEmailExists)
        return NextResponse.json(
          {
            success: false,
            message: "The provided email is already taken!",
          },
          { status: 409 }
        );
    }

    // Update db record
    const updatedUser = await prisma.user.update({
      where: {
        id: foundUser.id,
      },
      data: {
        email: email ? email : foundUser.email,
        image: image ? image : foundUser.image,
        name: name ? name : foundUser.name,
        username: username ? username : foundUser.username,
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Sorry, an unexpected error occurred updating your details",
        },
        { status: 500 }
      );
    }

    // Send the user a notification email
    await sendNotificationEmail(
      `Your email: ${updatedUser.email} recently authorized an update of your account info`,
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
        message: "User details updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating your data. Please try again later.",
      },
      { status: 500 }
    );
  }
}
