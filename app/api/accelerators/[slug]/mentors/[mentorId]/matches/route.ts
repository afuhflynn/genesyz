import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; mentorId: string }> },
) {
  const { slug, mentorId } = await params;
  const { hasAccess } = await checkAcceleratorAccess(slug, "manage_team");

  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { startupId, focus } = body;

  if (!startupId) {
    return NextResponse.json({ error: "Startup ID is required" }, { status: 400 });
  }

  // Check if match exists
  const existing = await db.mentorMatch.findUnique({
    where: {
      mentorId_startupId: {
        mentorId,
        startupId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Mentor is already matched with this startup" }, { status: 400 });
  }

  const match = await db.mentorMatch.create({
    data: {
      mentorId,
      startupId,
      focus,
    },
  });

  return NextResponse.json({ data: match }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; mentorId: string }> },
) {
  const { slug, mentorId } = await params;
  const { hasAccess } = await checkAcceleratorAccess(slug, "manage_team");

  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startupId = searchParams.get("startupId");

  if (!startupId) {
    return NextResponse.json({ error: "Startup ID is required" }, { status: 400 });
  }

  await db.mentorMatch.delete({
    where: {
      mentorId_startupId: {
        mentorId,
        startupId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
