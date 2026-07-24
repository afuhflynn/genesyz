import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPrimaryOrganizationEntitlement, getWorkspaceContext } from "@/lib/polar/workspace-entitlements";

export async function GET(_request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlement, workspaceEntitlement, context, activeIdeas, activeStartups] =
      await Promise.all([
        db.entitlement.findUnique({
          where: { userId: session.user.id },
        }),
        getPrimaryOrganizationEntitlement(session.user.id),
        getWorkspaceContext(session.user.id),
        db.idea.count({
          where: {
            userId: session.user.id,
            isArchived: false,
          },
        }),
        db.startup.count({
          where: { userId: session.user.id, isActive: true },
        }),
      ]);

    if (!entitlement && !workspaceEntitlement) {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }

    const serializedWorkspace = workspaceEntitlement
      ? {
          ...workspaceEntitlement,
          storageBytes: workspaceEntitlement.storageBytes.toString(),
          storageLimitBytes: workspaceEntitlement.storageLimitBytes.toString(),
        }
      : null;

    const data = {
      subscription: workspaceEntitlement?.plan ?? entitlement?.plan,
      usage: {
        activeIdeas,
        maxIdeas: entitlement?.maxActiveIdeas ?? 3,
        activeStartups: context?.usage.activeStartups ?? activeStartups,
        maxStartups: workspaceEntitlement?.maxStartups ?? 1,
        seats: context?.usage.seats ?? 0,
        pendingInvitations: context?.usage.pendingInvitations ?? 0,
        hostedProjects: context?.usage.hostedProjects ?? 0,
        storageBytes: context?.usage.storageBytes.toString() ?? "0",
        storageLimitBytes: workspaceEntitlement?.storageLimitBytes.toString() ?? "0",
      },
      workspace: serializedWorkspace,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
