import type { AcceleratorRole, AcceleratorPermission } from "./accelerator-permissions";
import { hasAcceleratorPermission } from "./accelerator-permissions";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
