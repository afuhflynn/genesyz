import type { StartupMemberRole } from "@prisma/client";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type StartupPermission =
  | "view_startup"
  | "edit_startup"
  | "submit_weekly_update"
  | "manage_tasks"
  | "manage_team"
  | "delete_startup"
  | "view_settings";

const ROLE_PERMISSIONS: Record<StartupMemberRole, StartupPermission[]> = {
  OWNER: [
    "view_startup",
    "edit_startup",
    "submit_weekly_update",
    "manage_tasks",
    "manage_team",
    "delete_startup",
    "view_settings",
  ],
  ADMIN: [
    "view_startup",
    "edit_startup",
    "submit_weekly_update",
    "manage_tasks",
    "manage_team",
    "view_settings",
  ],
  MEMBER: ["view_startup", "submit_weekly_update", "manage_tasks"],
  VIEWER: ["view_startup"],
};

export type { StartupMemberRole };

export { ROLE_PERMISSIONS };

export function hasPermission(
  role: StartupMemberRole,
  permission: StartupPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export async function getUserStartupRole(
  userId: string,
  startupId: string,
): Promise<StartupMemberRole | null> {
  const startup = await db.startup.findFirst({
    where: { id: startupId, userId },
    select: { userId: true },
  });

  if (startup) {
    return "OWNER";
  }

  const membership = await db.startupMember.findUnique({
    where: {
      startupId_userId: {
        startupId,
        userId,
      },
    },
    select: { role: true },
  });

  return membership?.role ?? null;
}

export async function checkStartupAccess(
  startupSlugOrId: string,
  requiredPermission?: StartupPermission,
): Promise<{
  hasAccess: boolean;
  role: StartupMemberRole | null;
  startupId: string | null;
  userId: string | null;
}> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { hasAccess: false, role: null, startupId: null, userId: null };
  }

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ slug: startupSlugOrId }, { id: startupSlugOrId }],
      isActive: true,
    },
    select: { id: true, userId: true, organizationId: true },
  });

  if (!startup) {
    return { hasAccess: false, role: null, startupId: null, userId: null };
  }

  // Try Better Auth org path first
  if (startup.organizationId) {
    const orgMember = await db.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: startup.organizationId,
          userId: session.user.id,
        },
      },
      select: { role: true },
    });

    if (orgMember) {
      const legacyRole = baRoleToLegacyRole(orgMember.role);
      if (legacyRole) {
        if (requiredPermission && !hasPermission(legacyRole, requiredPermission)) {
          return {
            hasAccess: false,
            role: legacyRole,
            startupId: startup.id,
            userId: session.user.id,
          };
        }
        return {
          hasAccess: true,
          role: legacyRole,
          startupId: startup.id,
          userId: session.user.id,
        };
      }
    }

    // Owner is not a member yet — add them
    if (!orgMember && startup.userId === session.user.id) {
      const org = await db.organization.findUnique({
        where: { id: startup.organizationId },
        select: { id: true },
      });

      if (org) {
        await db.member.create({
          data: {
            organizationId: org.id,
            userId: session.user.id,
            role: "owner",
          },
        });
        return {
          hasAccess: true,
          role: "OWNER" as StartupMemberRole,
          startupId: startup.id,
          userId: session.user.id,
        };
      }
    }
  }

  // Fallback: legacy StartupMember check
  const role = await getUserStartupRole(session.user.id, startup.id);

  if (!role) {
    return {
      hasAccess: false,
      role: null,
      startupId: startup.id,
      userId: session.user.id,
    };
  }

  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return {
      hasAccess: false,
      role,
      startupId: startup.id,
      userId: session.user.id,
    };
  }

  return {
    hasAccess: true,
    role,
    startupId: startup.id,
    userId: session.user.id,
  };
}

function baRoleToLegacyRole(baRole: string): StartupMemberRole | null {
  const map: Record<string, StartupMemberRole> = {
    owner: "OWNER",
    admin: "ADMIN",
    member: "MEMBER",
    viewer: "VIEWER",
  };
  return map[baRole] ?? null;
}

export const ROLE_LABELS: Record<StartupMemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<StartupMemberRole, string> = {
  OWNER: "Full access to all features including team management and deletion",
  ADMIN:
    "Can manage team members, edit startup details, and submit weekly updates",
  MEMBER: "Can submit weekly updates and view startup dashboard",
  VIEWER: "View-only access to the startup dashboard",
};

export const ROLE_HINTS: Record<StartupMemberRole, string[]> = {
  OWNER: [
    "Full access to all features",
    "Can add/remove team members",
    "Can change team member roles",
    "Can delete the startup",
    "Can edit all startup details",
  ],
  ADMIN: [
    "Can add/remove team members",
    "Can change team member roles",
    "Can edit startup profile",
    "Can submit weekly updates",
  ],
  MEMBER: [
    "Can submit weekly updates",
    "Can view startup dashboard",
    "Can view team members",
  ],
  VIEWER: ["View-only access", "Can view team members"],
};
