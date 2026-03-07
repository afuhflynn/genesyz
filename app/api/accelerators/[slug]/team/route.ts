import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";
import crypto from "crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_metrics", // Basic view access
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await db.acceleratorMember.findMany({
    where: { acceleratorId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  // Also include the owner as a virtual member if not already there
  const accelerator = await db.accelerator.findUnique({
    where: { id: acceleratorId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({
    data: members,
    owner: accelerator?.owner,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId, userId } = await checkAcceleratorAccess(
    slug,
    "manage_team",
  );

  if (!hasAccess || !acceleratorId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email and role are required" },
      { status: 400 },
    );
  }

  // Check if already a member
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await db.acceleratorMember.findUnique({
      where: {
        acceleratorId_userId: {
          acceleratorId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this accelerator" },
        { status: 400 },
      );
    }
  }

  // Create invitation
  const invitation = await db.acceleratorInvitation.create({
    data: {
      acceleratorId,
      email,
      role,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      invitedById: userId,
    },
  });

  // In a real app, send email here

  return NextResponse.json({ data: invitation }, { status: 201 });
}
