import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ajAuth, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { getServerSession } from "@/lib/get-server-session";
import { updatePasswordSchema } from "@/lib/validators/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(req, session.user.id, ajAuth);
    if (decision) return rateLimitResponse(decision);

    const body = await req.json();
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body);

    const account = await db.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
    });

    if (!account?.password) {
      return NextResponse.json(
        { success: false, message: "No password account found" },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(currentPassword, account.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
