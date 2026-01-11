import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ideas/[id] - Get a single idea with all details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const idea = await db.idea.findUnique({
    where: { id },
    include: {
      inputs: true,
      scores: {
        orderBy: { createdAt: "desc" },
      },
      researchPackets: {
        orderBy: { createdAt: "desc" },
      },
      researchJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  // Ensure user owns this idea
  if (idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(idea);
}

// DELETE /api/ideas/[id] - Delete an idea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const idea = await db.idea.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.idea.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "idea.deleted",
      resource: "idea",
      resourceId: id,
    },
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/ideas/[id] - Update an idea (archive/unarchive)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const idea = await db.idea.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedIdea = await db.idea.update({
    where: { id },
    data: {
      isArchived: body?.isArchived,
      title: body.title,
      summary: body.summary,
    },
    include: {
      inputs: true,
      scores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(updatedIdea);
}
