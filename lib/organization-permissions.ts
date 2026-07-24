import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getOrganizationAccess(organizationId: string, manage = false) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { user: null, organizationId: null, allowed: false, manageable: false };
  const membership = await db.member.findUnique({ where: { organizationId_userId: { organizationId, userId: session.user.id } }, select: { role: true } });
  const manageable = membership?.role === "owner" || membership?.role === "admin";
  return { user: session.user, organizationId, allowed: !!membership && (!manage || manageable), manageable };
}
