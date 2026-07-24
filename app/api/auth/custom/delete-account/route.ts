import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/client";
import { renderPremiumEmail } from "@/lib/email/send";
import { ajAuth, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/get-server-session";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(req, session.user.id, ajAuth);
    if (decision) return rateLimitResponse(decision);

    const userId = session.user.id;

    await db.user.update({
      where: { id: userId },
      data: { accountStatus: "DELETED" },
    });

    const contentHtml = `
      <h2 style="font-size: 24px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
        Account Deleted
      </h2>
      <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
        Your Genesyz account has been permanently deleted. All your ideas, startups, and data have been removed.
      </p>
      <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
        If this was a mistake, you'll need to create a new account to use Genesyz again.
      </p>
    `;
    const html = renderPremiumEmail({
      title: "Account Deleted",
      contentHtml,
    });
    await sendEmail({
      to: session.user.email,
      subject: "Your Genesyz account has been deleted",
      html,
    });

    return NextResponse.json(
      { success: true, message: "Account deleted permanently" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
