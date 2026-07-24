import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  archiveGuideConversation,
  getGuideConversation,
  initializeGuideConversation,
  listGuideConversations,
  sendGuideMessage,
} from "@/lib/agents/guide";
import { auth } from "@/lib/auth";
import { ajChat, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { db } from "@/lib/db";

// GET /api/ideas/[id]/guide - List conversations or get specific one
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    // Verify idea belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (conversationId) {
      // Get specific conversation
      const conversation = await getGuideConversation(
        conversationId,
        session.user.id,
      );
      return NextResponse.json(conversation);
    } else {
      // List all conversations for this idea
      const conversations = await listGuideConversations(
        ideaId,
        session.user.id,
      );
      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error("Error fetching guide conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

// POST /api/ideas/[id]/guide - Initialize new conversation or send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(request, session.user.id, ajChat);
    if (decision) return rateLimitResponse(decision);

    const { id: ideaId } = await params;
    const body = await request.json();
    const { action } = body;

    // Verify idea belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
      include: {
        researchPackets: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (action === "initialize") {
      // Initialize new conversation
      const result = await initializeGuideConversation({
        ideaId,
        userId: session.user.id,
        originalPrompt: idea.originalPrompt,
        interpretedPrompt: idea.interpretedPrompt,
        researchPackets: idea.researchPackets,
        locationContext: idea.locationContext as any,
      });

      return NextResponse.json(result, { status: 201 });
    } else if (action === "message") {
      // Send message to existing conversation
      const { conversationId, message } = body;

      if (!conversationId || !message) {
        return NextResponse.json(
          { error: "Conversation ID and message are required" },
          { status: 400 },
        );
      }

      const result = await sendGuideMessage(
        conversationId,
        message,
        session.user.id,
      );

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in guide conversation:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

// DELETE /api/ideas/[id]/guide - Archive a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 },
      );
    }

    // Verify idea belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    await archiveGuideConversation(conversationId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving guide conversation:", error);
    return NextResponse.json(
      { error: "Failed to archive conversation" },
      { status: 500 },
    );
  }
}
