import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { StartupMemberRole } from "@prisma/client";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "view_startup");

  if (!access.hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    select: {
      id: true,
      name: true,
      userId: true,
      createdAt: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const members = await db.startupMember.findMany({
    where: { startupId: startup.id },
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
    orderBy: { createdAt: "asc" },
  });

  const owner = await db.user.findUnique({
    where: { id: startup.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  const allMembers = [
    {
      id: `owner-${startup.userId}`,
      userId: startup.userId,
      role: "OWNER" as StartupMemberRole,
      createdAt: startup.createdAt,
      user: owner,
      isOwner: true,
    },
    ...members.map((m) => ({
      ...m,
      isOwner: false,
    })),
  ];

  return NextResponse.json({ data: allMembers });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "manage_team");

  if (!access.hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    select: {
      id: true,
      name: true,
      userId: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const body = await request.json();
  const { userId, role = "MEMBER" } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (startup.userId === userId) {
    return NextResponse.json(
      { error: "Cannot add the owner as a team member" },
      { status: 400 },
    );
  }

  const existingMember = await db.startupMember.findUnique({
    where: {
      startupId_userId: {
        startupId: startup.id,
        userId,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json(
      { error: "User is already a team member" },
      { status: 400 },
    );
  }

  const member = await db.startupMember.create({
    data: {
      startupId: startup.id,
      userId,
      role: role as StartupMemberRole,
    },
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
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.member.added",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        memberUserId: userId,
        memberEmail: targetUser.email,
        memberName: targetUser.name,
        role,
      },
    },
  });

  return NextResponse.json({
    data: {
      ...member,
      isOwner: false,
    },
  });
}
