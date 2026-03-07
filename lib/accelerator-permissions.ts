import type { AcceleratorRole } from "@prisma/client";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type AcceleratorPermission =
  | "manage_accelerator" // Edit settings, delete
  | "manage_team"        // Invite, remove, change roles
  | "manage_cohorts"     // Create/edit cohorts
  | "manage_startups"    // Onboard startups, view metrics
  | "manage_events"      // Create workshops, mentor sessions
  | "manage_kpis"        // Set and track KPIs
  | "view_metrics"       // View aggregated growth metrics
  | "view_startups"      // View startup details
  | "submit_reports"     // Hub weekly reports
  | "flag_startups";     // Flag underperforming startups

const ROLE_PERMISSIONS: Record<AcceleratorRole, AcceleratorPermission[]> = {
  OWNER: [
    "manage_accelerator",
    "manage_team",
    "manage_cohorts",
    "manage_startups",
    "manage_events",
    "manage_kpis",
    "view_metrics",
    "view_startups",
    "submit_reports",
    "flag_startups",
  ],
  PROGRAM_MANAGER: [
    "manage_cohorts",
    "manage_startups",
    "manage_kpis",
    "view_metrics",
    "view_startups",
    "submit_reports",
    "flag_startups",
    "manage_events",
  ],
  OPERATIONS_LEAD: [
    "manage_events",
    "view_startups",
    "manage_startups", // For basic onboarding tasks
  ],
  MENTOR: [
    "view_startups",
  ],
  OBSERVER: [
    "view_metrics",
    "view_startups",
  ],
};

export type { AcceleratorRole };

export function hasAcceleratorPermission(
  role: AcceleratorRole,
  permission: AcceleratorPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export async function getUserAcceleratorRole(
  userId: string,
  acceleratorId: string,
): Promise<AcceleratorRole | null> {
  const accelerator = await db.accelerator.findFirst({
    where: { id: acceleratorId, ownerId: userId },
    select: { ownerId: true },
  });

  if (accelerator) {
    return "OWNER";
  }

  const membership = await db.acceleratorMember.findUnique({
    where: {
      acceleratorId_userId: {
        acceleratorId,
        userId,
      },
    },
    select: { role: true },
  });

  return membership?.role ?? null;
}

export async function checkAcceleratorAccess(
  acceleratorSlugOrId: string,
  requiredPermission?: AcceleratorPermission,
): Promise<{
  hasAccess: boolean;
  role: AcceleratorRole | null;
  acceleratorId: string | null;
  userId: string | null;
}> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { hasAccess: false, role: null, acceleratorId: null, userId: null };
  }

  const accelerator = await db.accelerator.findFirst({
    where: {
      OR: [{ slug: acceleratorSlugOrId }, { id: acceleratorSlugOrId }],
      isActive: true,
    },
    select: { id: true, ownerId: true },
  });

  if (!accelerator) {
    return { hasAccess: false, role: null, acceleratorId: null, userId: null };
  }

  const role = await getUserAcceleratorRole(session.user.id, accelerator.id);

  if (!role) {
    return {
      hasAccess: false,
      role: null,
      acceleratorId: accelerator.id,
      userId: session.user.id,
    };
  }

  if (requiredPermission && !hasAcceleratorPermission(role, requiredPermission)) {
    return {
      hasAccess: false,
      role,
      acceleratorId: accelerator.id,
      userId: session.user.id,
    };
  }

  return {
    hasAccess: true,
    role,
    acceleratorId: accelerator.id,
    userId: session.user.id,
  };
}

export const ACCELERATOR_ROLE_LABELS: Record<AcceleratorRole, string> = {
  OWNER: "Owner (Superior Admin)",
  PROGRAM_MANAGER: "Program Manager",
  OPERATIONS_LEAD: "Operations Lead",
  MENTOR: "Mentor",
  OBSERVER: "Observer",
};

export const ACCELERATOR_ROLE_DESCRIPTIONS: Record<AcceleratorRole, string> = {
  OWNER: "Full access to all features including team management, billing, and deletion.",
  PROGRAM_MANAGER: "Manages cohorts, startups, KPIs, and hub reporting. Can flag startups.",
  OPERATIONS_LEAD: "Manages events, curriculum, and logistics. Can view startup details.",
  MENTOR: "View-only access to assigned startups to provide guidance.",
  OBSERVER: "Read-only access to metrics and startup progress for stakeholders.",
};
