import { db } from "@/lib/db";
import { PLANS, type PlanId } from "./client";

/**
 * Check if a user is allowed to create a new idea based on their entitlement
 * This is the core server-side enforcement function
 */
export async function isAllowedToCreateIdea(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  maxAllowed: number;
}> {
  // Get user's entitlement
  const entitlement = await db.entitlement.findUnique({
    where: { userId },
  });

  // Get count of active (non-archived) ideas
  const activeIdeasCount = await db.idea.count({
    where: {
      userId,
      isArchived: false,
    },
  });

  // Determine max allowed based on plan
  const plan = entitlement?.plan || "FREE";
  const maxAllowed =
    PLANS[plan as PlanId]?.maxActiveIdeas || PLANS.FREE.maxActiveIdeas;

  if (activeIdeasCount >= maxAllowed) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${maxAllowed} active ideas. Upgrade to Pro for unlimited ideas, or archive existing ideas to free up space.`,
      currentCount: activeIdeasCount,
      maxAllowed,
    };
  }

  return {
    allowed: true,
    currentCount: activeIdeasCount,
    maxAllowed,
  };
}

/**
 * Get user's current usage statistics
 */
export async function getUserUsage(userId: string): Promise<{
  activeIdeas: number;
  maxIdeas: number;
  plan: PlanId;
  canCreateIdea: boolean;
}> {
  const entitlement = await db.entitlement.findUnique({
    where: { userId },
  });

  const activeIdeasCount = await db.idea.count({
    where: {
      userId,
      isArchived: false,
    },
  });

  const plan = (entitlement?.plan || "FREE") as PlanId;
  const maxIdeas = PLANS[plan]?.maxActiveIdeas || PLANS.FREE.maxActiveIdeas;

  return {
    activeIdeas: activeIdeasCount,
    maxIdeas,
    plan,
    canCreateIdea: activeIdeasCount < maxIdeas,
  };
}

/**
 * Sync entitlement from Polar webhook data
 */
export async function syncEntitlement(
  userId: string,
  data: {
    polarCustomerId?: string;
    polarSubscriptionId?: string;
    plan: PlanId;
    status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "EXPIRED";
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<void> {
  const maxActiveIdeas =
    PLANS[data.plan]?.maxActiveIdeas || PLANS.FREE.maxActiveIdeas;

  await db.entitlement.upsert({
    where: { userId },
    create: {
      userId,
      polarCustomerId: data.polarCustomerId,
      polarSubscriptionId: data.polarSubscriptionId,
      plan: data.plan,
      maxActiveIdeas: maxActiveIdeas === Infinity ? 999999 : maxActiveIdeas,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
    },
    update: {
      polarCustomerId: data.polarCustomerId,
      polarSubscriptionId: data.polarSubscriptionId,
      plan: data.plan,
      maxActiveIdeas: maxActiveIdeas === Infinity ? 999999 : maxActiveIdeas,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
    },
  });
}

/**
 * Create default free entitlement for new users
 */
export async function createDefaultEntitlement(userId: string): Promise<void> {
  await db.entitlement.upsert({
    where: { userId },
    create: {
      userId,
      plan: "FREE",
      maxActiveIdeas: PLANS.FREE.maxActiveIdeas,
      status: "ACTIVE",
    },
    update: {}, // No update needed if exists
  });
}
