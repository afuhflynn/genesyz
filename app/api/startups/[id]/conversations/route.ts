import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

/**
 * GET /api/startups/[id]/conversations
 * List all chat conversations for a startup
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const conversations = await db.startupConversation.findMany({
      where: {
        startupId: access.startupId,
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error("[STARTUP_CONVERSATIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/startups/[id]/conversations
 * Create a new chat conversation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { title } = body;

    const conversation = await db.startupConversation.create({
      data: {
        startupId: access.startupId,
        title: title || "New Strategy Session",
      },
    });

    return NextResponse.json({ data: conversation }, { status: 201 });
  } catch (error) {
    console.error("[STARTUP_CONVERSATIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
