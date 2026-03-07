import type { AcceleratorRole } from "@prisma/client";

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

export const ROLE_PERMISSIONS: Record<AcceleratorRole, AcceleratorPermission[]> = {
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
    "view_metrics",    // Added to allow dashboard access
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
