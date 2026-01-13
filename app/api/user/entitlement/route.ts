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

    const entitlement = await db.entitlement.findUnique({
      where: { userId: session.user.id },
    });

    if (!entitlement) {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }

    return NextResponse.json(entitlement);
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
