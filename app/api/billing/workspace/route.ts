import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WORKSPACE_PLANS } from "@/lib/polar/client";
import { getWorkspaceContext } from "@/lib/polar/workspace-entitlements";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.member.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const context = await getWorkspaceContext(session.user.id);
  if (!context) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  const entitlement = context.entitlement;

  const serializedEntitlement = {
    ...entitlement,
    storageBytes: entitlement.storageBytes.toString(),
    storageLimitBytes: entitlement.storageLimitBytes.toString(),
  };

  return NextResponse.json({
    organizationId: membership.organizationId,
    entitlement: serializedEntitlement,
    usage: {
      activeStartups: context.usage.activeStartups,
      maxStartups: serializedEntitlement.maxStartups,
      activeIdeas: context.usage.activeIdeas,
      seats: context.usage.seats,
      pendingInvitations: context.usage.pendingInvitations,
      hostedProjects: context.usage.hostedProjects,
      storageBytes: context.usage.storageBytes.toString(),
      storageLimitBytes: serializedEntitlement.storageLimitBytes,
      canCreateStartup: context.usage.activeStartups < serializedEntitlement.maxStartups,
    },
    catalog: Object.values(WORKSPACE_PLANS),
  });
}
