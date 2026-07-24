import {
  checkStartupAccess,
  hasPermission,
  type StartupPermission,
} from "@/lib/startup-permissions";

export async function getStartupSchoolAccess(
  slug: string,
  permission: StartupPermission = "view_startup",
) {
  const access = await checkStartupAccess(slug, permission);
  if (!access.hasAccess || !access.startupId || !access.role) return null;
  return {
    startupId: access.startupId,
    role: access.role,
    canManageTeam: hasPermission(access.role, "manage_team"),
  };
}

export async function requireStartupSchoolAccess(slug: string) {
  const access = await getStartupSchoolAccess(slug);
  if (!access) throw new Error("STARTUP_SCHOOL_ACCESS_DENIED");
  return access;
}
