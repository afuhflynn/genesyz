import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlement, user] = await db.$transaction([
      db.entitlement.findUnique({
        where: { userId: session.user.id },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        include: {
          _count: {
            select: {
              ideas: {
                where: {
                  userId: session.user.id,
                  isArchived: false,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!entitlement) {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }

    const data = {
      ...user,
      entitlement: entitlement || null,
      _count: {
        ideas: user?._count.ideas || 0,
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (name && typeof name === "string" && name.trim() === "") {
      return NextResponse.json(
        { error: "A valid name cannot be empty" },
        { status: 400 },
      );
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    return NextResponse.json({ sucess: true });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
