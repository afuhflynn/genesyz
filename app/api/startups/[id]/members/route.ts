import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import {
  checkStartupAccess,
  type StartupMemberRole,
} from "@/lib/startup-permissions";

const LEGACY_ROLE_TO_BA: Record<string, string> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

const BA_ROLE_TO_LEGACY: Record<string, StartupMemberRole> = {
  owner: "OWNER",
  admin: "ADMIN",
  member: "MEMBER",
  viewer: "VIEWER",
};

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

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
      userId: true,
      createdAt: true,
      organizationId: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const owner = await db.user.findUnique({
    where: { id: startup.userId },
    select: { id: true, name: true, email: true, image: true },
  });

  const allMembers: Array<{
    id: string;
    userId: string;
    role: StartupMemberRole;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    isOwner: boolean;
  }> = [];

  // Try Better Auth org path
  if (startup.organizationId) {
    const baMembers = await db.member.findMany({
      where: { organizationId: startup.organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    for (const m of baMembers) {
      const legacyRole = BA_ROLE_TO_LEGACY[m.role];
      if (!legacyRole) continue;
      allMembers.push({
        id: m.id,
        userId: m.userId,
        role: legacyRole,
        createdAt: m.createdAt,
        user: m.user,
        isOwner: m.role === "owner",
      });
    }
  } else {
    // Fallback: legacy StartupMember table
    const legacyMembers = await db.startupMember.findMany({
      where: { startupId: startup.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    allMembers.push({
      id: `owner-${startup.userId}`,
      userId: startup.userId,
      role: "OWNER",
      createdAt: startup.createdAt,
      user: owner,
      isOwner: true,
    });

    for (const m of legacyMembers) {
      allMembers.push({ ...m, isOwner: false });
    }
  }

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

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      organizationId: true,
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

  let member: Record<string, unknown>;

  if (startup.organizationId) {
    const existingBaMember = await db.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: startup.organizationId,
          userId,
        },
      },
    });

    if (existingBaMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 },
      );
    }

    const baMember = await db.member.create({
      data: {
        organizationId: startup.organizationId,
        userId,
        role: LEGACY_ROLE_TO_BA[role],
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    // Sync backward to legacy table so we can migrate incrementally
    await db.startupMember.upsert({
      where: { startupId_userId: { startupId: startup.id, userId } },
      update: { role: role as StartupMemberRole },
      create: {
        startupId: startup.id,
        userId,
        role: role as StartupMemberRole,
      },
    });

    member = { ...baMember, isOwner: false };
  } else {
    const existingLegacy = await db.startupMember.findUnique({
      where: {
        startupId_userId: { startupId: startup.id, userId },
      },
    });

    if (existingLegacy) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 },
      );
    }

    const legacyMember = await db.startupMember.create({
      data: {
        startupId: startup.id,
        userId,
        role: role as StartupMemberRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    member = { ...legacyMember, isOwner: false };
  }

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

  await inngest.send({
    name: "startup.member.added",
    data: {
      startupId: startup.id,
      startupName: startup.name,
      startupSlug: startup.slug || startup.id,
      newMemberUserId: userId,
      newMemberEmail: targetUser.email,
      newMemberName: targetUser.name || "Team Member",
      newMemberRole: role,
      addedByUserId: session.user.id,
    },
  });

  return NextResponse.json({ data: member });
}
