import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/get-server-session";
import { emailPreferencesSchema } from "@/lib/validators/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailNotifications } = emailPreferencesSchema.parse(body);

    await db.user.update({
      where: { id: session.user.id },
      data: { emailNotifications },
    });

    return NextResponse.json(
      { success: true, emailNotifications },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email preferences error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
