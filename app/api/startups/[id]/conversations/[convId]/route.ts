import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

/**
 * GET /api/startups/[id]/conversations/[convId]
 * Get a specific conversation with its messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; convId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug, convId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const conversation = await db.startupConversation.findFirst({
      where: {
        id: convId,
        startupId: access.startupId,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error("[STARTUP_CONVERSATION_DETAIL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/startups/[id]/conversations/[convId]
 * Soft delete a conversation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; convId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug, convId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "manage_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db.startupConversation.update({
      where: {
        id: convId,
        startupId: access.startupId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STARTUP_CONVERSATION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
