import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkStartupAccess,
  type StartupMemberRole,
} from "@/lib/startup-permissions";

const BA_ROLE_TO_LEGACY: Record<string, StartupMemberRole> = {
  owner: "OWNER",
  admin: "ADMIN",
  member: "MEMBER",
  viewer: "VIEWER",
};

const LEGACY_ROLE_TO_BA: Record<string, string> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

async function resolveStartup(
  id: string,
): Promise<{ id: string; userId: string; organizationId: string | null } | null> {
  return await db.startup.findUnique({
    where: { id },
    select: { id: true, userId: true, organizationId: true },
  });
}

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

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await resolveStartup(access.startupId);

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

  let updatedMember: Record<string, unknown>;

  if (startup.organizationId) {
    const baMember = await db.member.findFirst({
      where: {
        id: memberId,
        organizationId: startup.organizationId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!baMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (baMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change owner role" },
        { status: 400 },
      );
    }

    const oldRole = baMember.role;

    await db.member.update({
      where: { id: memberId },
      data: { role: LEGACY_ROLE_TO_BA[role] },
    });

    // Sync to legacy table
    await db.startupMember.updateMany({
      where: { startupId: startup.id, userId: baMember.userId },
      data: { role: role as StartupMemberRole },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "startup.member.role_changed",
        resource: "startup",
        resourceId: startup.id,
        metadata: {
          memberUserId: baMember.userId,
          memberEmail: baMember.user.email,
          memberName: baMember.user.name,
          oldRole: BA_ROLE_TO_LEGACY[oldRole],
          newRole: role,
        },
      },
    });

    updatedMember = { ...baMember, role, isOwner: false };
  } else {
    const member = await db.startupMember.findFirst({
      where: { id: memberId, startupId: startup.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const oldRole = member.role;

    const legacyUpdated = await db.startupMember.update({
      where: { id: memberId },
      data: { role: role as StartupMemberRole },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
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

    updatedMember = { ...legacyUpdated, isOwner: false };
  }

  return NextResponse.json({ data: updatedMember });
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

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await resolveStartup(access.startupId);

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  if (memberId.startsWith("owner-")) {
    return NextResponse.json(
      { error: "Cannot remove the owner" },
      { status: 400 },
    );
  }

  if (startup.organizationId) {
    const baMember = await db.member.findFirst({
      where: {
        id: memberId,
        organizationId: startup.organizationId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!baMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (baMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 400 },
      );
    }

    await db.member.delete({ where: { id: memberId } });

    // Clean up legacy table
    await db.startupMember.deleteMany({
      where: { startupId: startup.id, userId: baMember.userId },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "startup.member.removed",
        resource: "startup",
        resourceId: startup.id,
        metadata: {
          memberUserId: baMember.userId,
          memberEmail: baMember.user.email,
          memberName: baMember.user.name,
          previousRole: BA_ROLE_TO_LEGACY[baMember.role],
        },
      },
    });
  } else {
    const member = await db.startupMember.findFirst({
      where: { id: memberId, startupId: startup.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await db.startupMember.delete({ where: { id: memberId } });

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
  }

  return NextResponse.json({ success: true });
}
