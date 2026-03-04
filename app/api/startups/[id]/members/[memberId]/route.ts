import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkStartupAccess,
  type StartupMemberRole,
} from "@/lib/startup-permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

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
  const { role } = body;

  if (!role || !["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (memberId.startsWith("owner-")) {
    return NextResponse.json(
      { error: "Cannot change owner role" },
      { status: 400 },
    );
  }

  const member = await db.startupMember.findUnique({
    where: {
      id: memberId,
      startupId: startup.id,
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

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const oldRole = member.role;

  const updatedMember = await db.startupMember.update({
    where: { id: memberId },
    data: { role: role as StartupMemberRole },
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
      action: "startup.member.role_changed",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        memberUserId: member.userId,
        memberEmail: member.user.email,
        memberName: member.user.name,
        oldRole,
        newRole: role,
      },
    },
  });

  return NextResponse.json({
    data: {
      ...updatedMember,
      isOwner: false,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, memberId } = await params;

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

  if (memberId.startsWith("owner-")) {
    return NextResponse.json(
      { error: "Cannot remove the owner" },
      { status: 400 },
    );
  }

  const member = await db.startupMember.findUnique({
    where: {
      id: memberId,
      startupId: startup.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await db.startupMember.delete({
    where: { id: memberId },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.member.removed",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        memberUserId: member.userId,
        memberEmail: member.user.email,
        memberName: member.user.name,
        previousRole: member.role,
      },
    },
  });

  return NextResponse.json({ success: true });
}
