import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

async function getAuthorizedProject(userId: string, startupId: string, projectId: string) {
  const access = await checkStartupAccess(startupId, "view_startup");
  if (!access.hasAccess || !access.startupId) return null;
  return db.hostedProject.findFirst({
    where: { id: projectId, startupId: access.startupId },
    include: {
      route: true,
      activeRelease: true,
      releases: { orderBy: { version: "desc" }, take: 10, include: { events: { orderBy: { createdAt: "desc" } } } },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, projectId } = await params;
  const project = await getAuthorizedProject(session.user.id, id, projectId);
  if (!project) return NextResponse.json({ error: "Hosted project not found" }, { status: 404 });
  return NextResponse.json({ data: project });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, projectId } = await params;

  try {
    const access = await checkStartupAccess(id, "edit_startup");
    if (!access.hasAccess || !access.startupId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    await checkWorkspaceCapability(session.user.id, "hosting", access.startupId);
    const project = await db.hostedProject.findFirst({
      where: { id: projectId, startupId: access.startupId },
      include: { activeRelease: true, releases: { orderBy: { version: "desc" }, take: 2 } },
    });
    const previous = project?.releases.find((release) => release.id !== project.activeReleaseId);
    if (!project || !previous) return NextResponse.json({ error: "No previous release available" }, { status: 409 });

    const rolledBack = await db.$transaction(async (tx) => {
      await tx.hostedRelease.update({ where: { id: project.activeReleaseId! }, data: { status: "ROLLED_BACK" } });
      await tx.hostedRelease.update({ where: { id: previous.id }, data: { status: "LIVE", promotedAt: new Date(), events: { create: { type: "ROLLED_BACK", message: "Previous release restored" } } } });
      return tx.hostedProject.update({ where: { id: project.id }, data: { activeReleaseId: previous.id }, include: { activeRelease: true, route: true } });
    });
    return NextResponse.json({ data: rolledBack });
  } catch (error) {
    const entitlementResponse = entitlementErrorResponse(error);
    if (entitlementResponse) return entitlementResponse;
    console.error("[HOSTED_ROLLBACK]", error);
    return NextResponse.json({ error: "Failed to roll back hosted project" }, { status: 500 });
  }
}
