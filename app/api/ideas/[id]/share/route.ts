import { customAlphabet } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ideaId } = await params;

  const idea = await db.idea.findFirst({
    where: {
      id: ideaId,
      userId: session.user.id,
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  // Generate or use existing token
  const shareToken = idea.shareToken || nanoid(12);

  if (!idea.shareToken) {
    await db.idea.update({
      where: { id: ideaId },
      data: { shareToken },
    });
  }

  return NextResponse.json({
    shareToken,
    shareUrl: `/ideas/shared/${shareToken}`,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ideaId } = await params;

  const idea = await db.idea.findFirst({
    where: {
      id: ideaId,
      userId: session.user.id,
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  await db.idea.update({
    where: { id: ideaId },
    data: { shareToken: null },
  });

  return NextResponse.json({ success: true });
}
