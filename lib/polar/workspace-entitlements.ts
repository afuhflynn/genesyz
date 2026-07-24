import { db } from "@/lib/db";
import { WORKSPACE_PLANS, type WorkspacePlanId } from "./client";

export type WorkspaceCapability =
  | "builder"
  | "hosting"
  | "growthOS"
  | "advancedAI"
  | "exports"
  | "lmsAnalytics";

type UsageResource = "ai" | "builder";

export class WorkspaceEntitlementError extends Error {
  constructor(
    public readonly code: "FEATURE_NOT_INCLUDED" | "PLAN_LIMIT_REACHED" | "PAYMENT_REQUIRED",
    public readonly resource: string,
    public readonly limit?: number,
    public readonly used?: number,
  ) {
    super(code);
  }
}

export function workspacePlanFromPolarProduct(
  productId?: string,
): WorkspacePlanId {
  const productMap: Record<string, WorkspacePlanId> = {
    [process.env.NEXT_PUBLIC_POLAR_FOUNDER_PRODUCT_ID || ""]: "FOUNDER",
    [process.env.NEXT_PUBLIC_POLAR_TEAM_PRODUCT_ID || ""]: "TEAM",
    [process.env.NEXT_PUBLIC_POLAR_GROWTH_PRODUCT_ID || ""]: "GROWTH",
    [process.env.NEXT_PUBLIC_POLAR_ACCELERATOR_PRODUCT_ID || ""]: "ACCELERATOR",
    [process.env.NEXT_PUBLIC_POLAR_ENTERPRISE_PRODUCT_ID || ""]: "ENTERPRISE",
  };

  return (productId && productMap[productId]) || "EXPLORER";
}

export async function ensureOrganizationEntitlement(organizationId: string) {
  const existing = await db.organizationEntitlement.findUnique({
    where: { organizationId },
    select: { plan: true },
  });
  const defaults = WORKSPACE_PLANS[existing?.plan ?? "EXPLORER"];

  return db.organizationEntitlement.upsert({
    where: { organizationId },
    create: {
      organizationId,
      plan: defaults.id,
      seats: defaults.seats,
      maxStartups: defaults.maxStartups,
      aiCredits: defaults.aiCredits,
      builderCredits: defaults.builderCredits,
      hostingCredits: defaults.hostingCredits,
      storageLimitBytes: defaults.storageBytes,
      hostedProjectLimit: defaults.hostedProjectLimit,
      capabilities: defaults.capabilities,
    },
    update: {
      storageLimitBytes: defaults.storageBytes,
      hostedProjectLimit: defaults.hostedProjectLimit,
      capabilities: defaults.capabilities,
    },
  });
}

export async function ensureStartupEntitlement(startupId: string) {
  const startup = await db.startup.findUnique({
    where: { id: startupId },
    select: {
      organization: { select: { entitlement: true } },
    },
  });
  const defaults =
    WORKSPACE_PLANS[startup?.organization?.entitlement?.plan ?? "FOUNDER"];

  return db.startupEntitlement.upsert({
    where: { startupId },
    create: {
      startupId,
      plan: defaults.id,
      inherited: true,
      aiCredits: Math.min(25, defaults.aiCredits),
      builderCredits: defaults.builderCredits,
      hostingCredits: defaults.hostingCredits,
    },
    update: {},
  });
}

export async function getStartupEntitlement(startupId: string) {
  const startup = await db.startup.findUnique({
    where: { id: startupId },
    select: {
      id: true,
      organizationId: true,
      entitlement: true,
      organization: { select: { entitlement: true } },
    },
  });

  if (!startup) return null;

  const planId = (startup.entitlement?.plan ??
    startup.organization?.entitlement?.plan ??
    "FOUNDER") as WorkspacePlanId;

  return {
    ...startup,
    plan: WORKSPACE_PLANS[planId],
  };
}

export async function getPrimaryOrganizationEntitlement(userId: string) {
  const membership = await db.member.findFirst({
    where: { userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;
  return ensureOrganizationEntitlement(membership.organizationId);
}

export async function isAllowedToCreateStartup(userId: string) {
  const entitlement = await getPrimaryOrganizationEntitlement(userId);
  const maxStartups =
    entitlement?.maxStartups ?? WORKSPACE_PLANS.EXPLORER.maxStartups;
  const membership = await db.member.findFirst({
    where: { userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });
  const currentCount = await db.startup.count({
    where: membership
      ? { organizationId: membership.organizationId, isActive: true }
      : { userId, isActive: true },
  });

  return {
    allowed: currentCount < maxStartups,
    currentCount,
    maxStartups,
    reason:
      currentCount >= maxStartups
        ? `Your workspace has reached its limit of ${maxStartups} startup${maxStartups === 1 ? "" : "s"}. Upgrade your plan to create another startup.`
        : undefined,
    entitlement,
  };
}

export async function syncOrganizationEntitlements(
  userId: string,
  data: {
    polarCustomerId?: string;
    polarSubscriptionId?: string;
    plan: WorkspacePlanId;
    status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "EXPIRED";
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  },
) {
  const memberships = await db.member.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  const plan = WORKSPACE_PLANS[data.plan];

  await Promise.all(
    memberships.map(({ organizationId }) =>
      db.organizationEntitlement.upsert({
        where: { organizationId },
        create: {
          organizationId,
          polarCustomerId: data.polarCustomerId,
          polarSubscriptionId: data.polarSubscriptionId,
          plan: data.plan,
          status: data.status,
          seats: plan.seats,
          maxStartups: plan.maxStartups,
          aiCredits: plan.aiCredits,
          builderCredits: plan.builderCredits,
          hostingCredits: plan.hostingCredits,
          storageLimitBytes: plan.storageBytes,
          hostedProjectLimit: plan.hostedProjectLimit,
          capabilities: plan.capabilities,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        },
        update: {
          polarCustomerId: data.polarCustomerId,
          polarSubscriptionId: data.polarSubscriptionId,
          plan: data.plan,
          status: data.status,
          seats: plan.seats,
          maxStartups: plan.maxStartups,
          aiCredits: plan.aiCredits,
          builderCredits: plan.builderCredits,
          hostingCredits: plan.hostingCredits,
          storageLimitBytes: plan.storageBytes,
          hostedProjectLimit: plan.hostedProjectLimit,
          capabilities: plan.capabilities,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        },
      }),
    ),
  );

  const organizationIds = memberships.map(
    ({ organizationId }) => organizationId,
  );
  if (organizationIds.length > 0) {
    await db.startupEntitlement.updateMany({
      where: {
        inherited: true,
        startup: { organizationId: { in: organizationIds } },
      },
      data: {
        plan: data.plan,
        aiCredits: Math.min(25, plan.aiCredits),
        builderCredits: plan.builderCredits,
        hostingCredits: plan.hostingCredits,
      },
    });
  }
}

export async function consumeAICredit(userId: string, amount = 1) {
  try {
    const { context } = await reserveWorkspaceUsage(userId, "ai", amount, `legacy-ai:${userId}:${crypto.randomUUID()}`);
    return { allowed: true, remaining: context.entitlement.aiCredits - amount };
  } catch (error) {
    if (error instanceof WorkspaceEntitlementError) {
      const entitlement = await getPrimaryOrganizationEntitlement(userId);
      return { allowed: false, remaining: entitlement?.aiCredits ?? 0 };
    }
    throw error;
  }
}

export async function getWorkspaceContext(userId: string, startupId?: string) {
  const membership = startupId
    ? await db.member.findFirst({
        where: { userId, organization: { startups: { some: { id: startupId } } } },
        select: { organizationId: true },
      })
    : await db.member.findFirst({
        where: { userId },
        select: { organizationId: true },
        orderBy: { createdAt: "asc" },
      });

  if (!membership) return null;
  const entitlement = await ensureOrganizationEntitlement(membership.organizationId);
  const plan = WORKSPACE_PLANS[entitlement.plan];
  const [activeStartups, activeIdeas, seats, pendingInvitations, hostedProjects, usedStorage] = await Promise.all([
    db.startup.count({ where: { organizationId: membership.organizationId, isActive: true } }),
    db.idea.count({ where: { userId, isArchived: false } }),
    db.member.count({ where: { organizationId: membership.organizationId, role: { not: "owner" } } }),
    db.invitation.count({ where: { organizationId: membership.organizationId, status: "pending", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
    db.hostedProject.count({ where: { status: "ACTIVE", organizationId: membership.organizationId } }),
    db.workspaceFile.aggregate({ where: { organizationId: membership.organizationId, status: "ACTIVE", deletedAt: null }, _sum: { byteSize: true } }),
  ]);

  return {
    organizationId: membership.organizationId,
    entitlement,
    plan,
    usage: {
      activeStartups,
      activeIdeas,
      seats,
      pendingInvitations,
      hostedProjects,
      storageBytes: usedStorage._sum.byteSize ?? BigInt(0),
    },
  };
}

export async function checkWorkspaceCapability(userId: string, capability: WorkspaceCapability, startupId?: string) {
  const context = await getWorkspaceContext(userId, startupId);
  if (!context) {
    throw new WorkspaceEntitlementError("PAYMENT_REQUIRED", capability);
  }
  const capabilities = (context.entitlement.capabilities ?? {}) as Record<string, boolean>;
  if (capabilities[capability] !== true) {
    throw new WorkspaceEntitlementError("FEATURE_NOT_INCLUDED", capability);
  }
  return context;
}

export async function checkOrganizationCapability(userId: string, organizationId: string, capability: WorkspaceCapability) {
  const membership = await db.member.findUnique({ where: { organizationId_userId: { organizationId, userId } }, select: { organizationId: true } });
  if (!membership) throw new WorkspaceEntitlementError("PAYMENT_REQUIRED", capability);
  const entitlement = await ensureOrganizationEntitlement(organizationId);
  const capabilities = (entitlement.capabilities ?? {}) as Record<string, boolean>;
  if (capabilities[capability] !== true) throw new WorkspaceEntitlementError("FEATURE_NOT_INCLUDED", capability);
  return entitlement;
}

export async function assertSeatAvailable(userId: string, organizationId: string) {
  const entitlement = await ensureOrganizationEntitlement(organizationId);
  const [members, pending] = await Promise.all([
    db.member.count({ where: { organizationId, role: { not: "owner" } } }),
    db.invitation.count({ where: { organizationId, status: "pending", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
  ]);
  if (members + pending >= entitlement.seats) {
    throw new WorkspaceEntitlementError("PLAN_LIMIT_REACHED", "seats", entitlement.seats, members + pending);
  }
  return entitlement;
}

export async function reserveWorkspaceUsage(
  userId: string,
  resource: UsageResource,
  amount: number,
  operationKey: string,
  startupId?: string,
) {
  const context = await getWorkspaceContext(userId, startupId);
  if (!context) throw new WorkspaceEntitlementError("PAYMENT_REQUIRED", resource);
  const field = resource === "ai" ? "aiCredits" : "builderCredits";
  const result = await db.$transaction(async (tx) => {
    const existing = await tx.workspaceUsageEvent.findUnique({ where: { operationKey } });
    if (existing) return existing;
    const event = await tx.workspaceUsageEvent.create({
      data: { organizationId: context.organizationId, actorId: userId, startupId, resource, amount, operationKey },
    });
    const updated = await tx.organizationEntitlement.updateMany({
      where: { id: context.entitlement.id, status: { in: ["ACTIVE", "CANCELED"] }, [field]: { gte: amount } },
      data: { [field]: { decrement: amount } },
    });
    if (updated.count === 0) throw new WorkspaceEntitlementError("PLAN_LIMIT_REACHED", resource, Number(context.entitlement[field]));
    return event;
  }).catch((error) => {
    if (error instanceof WorkspaceEntitlementError) throw error;
    if (error?.code === "P2002") return db.workspaceUsageEvent.findUniqueOrThrow({ where: { operationKey } });
    throw error;
  });
  return { context, event: result };
}

export async function releaseWorkspaceUsage(userId: string, amount: number, operationKey: string) {
  const entitlement = await getPrimaryOrganizationEntitlement(userId);
  if (!entitlement) return;
  const refundKey = `${operationKey}:refund`;
  await db.$transaction(async (tx) => {
    const existing = await tx.workspaceUsageEvent.findUnique({ where: { operationKey: refundKey } });
    if (existing) return;
    await tx.organizationEntitlement.update({ where: { id: entitlement.id }, data: { aiCredits: { increment: amount } } });
    await tx.workspaceUsageEvent.create({ data: { organizationId: entitlement.organizationId, actorId: userId, resource: "ai", amount: -amount, operationKey: refundKey } });
  });
}

export async function registerWorkspaceFile(input: {
  userId: string;
  objectKey: string;
  url?: string;
  name?: string;
  mimeType?: string;
  byteSize: number;
}) {
  const context = await getWorkspaceContext(input.userId);
  if (!context) throw new WorkspaceEntitlementError("PAYMENT_REQUIRED", "storage");
  const limit = context.entitlement.storageLimitBytes;
  const updated = await db.organizationEntitlement.updateMany({
    where: { id: context.entitlement.id, storageBytes: { lte: limit - BigInt(input.byteSize) } },
    data: { storageBytes: { increment: input.byteSize } },
  });
  if (updated.count === 0) {
    throw new WorkspaceEntitlementError("PLAN_LIMIT_REACHED", "storage", Number(limit), Number(context.usage.storageBytes));
  }
  try {
    return await db.workspaceFile.create({
      data: {
        organizationId: context.organizationId,
        uploadedById: input.userId,
        objectKey: input.objectKey,
        url: input.url,
        name: input.name,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    await db.organizationEntitlement.update({ where: { id: context.entitlement.id }, data: { storageBytes: { decrement: input.byteSize } } });
    throw error;
  }
}

export async function removeWorkspaceFile(userId: string, objectKey: string) {
  const file = await db.workspaceFile.findFirst({ where: { objectKey, organization: { members: { some: { userId } } }, status: "ACTIVE" } });
  if (!file) return false;
  await db.$transaction([
    db.workspaceFile.update({ where: { id: file.id }, data: { status: "DELETED", deletedAt: new Date() } }),
    db.organizationEntitlement.update({ where: { organizationId: file.organizationId }, data: { storageBytes: { decrement: file.byteSize } } }),
  ]);
  return true;
}

export function entitlementErrorResponse(error: unknown) {
  if (!(error instanceof WorkspaceEntitlementError)) return null;
  return Response.json({ error: "This action is not available on your current plan.", code: error.code, resource: error.resource, limit: error.limit, used: error.used }, { status: error.code === "PAYMENT_REQUIRED" ? 402 : 403 });
}

export async function refundAICredit(userId: string, amount = 1) {
  const entitlement = await getPrimaryOrganizationEntitlement(userId);
  if (!entitlement) return;

  await db.organizationEntitlement.updateMany({
    where: { id: entitlement.id },
    data: { aiCredits: { increment: amount } },
  });
}
