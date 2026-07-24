import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { hostedProjectUrl, publishPrototypeAsHostedProject } from "@/lib/hosting";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prototypeId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, prototypeId } = await params;
  const access = await checkStartupAccess(id, "edit_startup");
  if (!access.hasAccess || !access.startupId) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  try {
    const context = await checkWorkspaceCapability(session.user.id, "hosting", access.startupId);
    const prototype = await db.prototype.findFirst({ where: { id: prototypeId, startupId: access.startupId } });
    if (!prototype) return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
    const published = await publishPrototypeAsHostedProject({
      organizationId: context.organizationId,
      startupId: access.startupId,
      prototypeId: prototype.id,
      prototypeName: prototype.name,
      html: prototype.html,
      hostedProjectLimit: context.entitlement.hostedProjectLimit,
    });
    return NextResponse.json({ data: published, url: hostedProjectUrl(published.slug) });
  } catch (error) {
    if (error instanceof Error && error.message === "HOSTED_PROJECT_LIMIT") return NextResponse.json({ error: "Hosted project limit reached", code: "PLAN_LIMIT_REACHED", resource: "hosting" }, { status: 403 });
    const entitlementResponse = entitlementErrorResponse(error);
    if (entitlementResponse) return entitlementResponse;
    console.error("[PROTOTYPE_PUBLISH]", error);
    return NextResponse.json({ error: "Failed to publish prototype" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; prototypeId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, prototypeId } = await params;
  const access = await checkStartupAccess(id, "edit_startup");
  if (!access.hasAccess || !access.startupId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const prototype = await db.prototype.findFirst({ where: { id: prototypeId, startupId: access.startupId } });
  if (!prototype) return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  await db.hostedProject.updateMany({ where: { prototypeId: prototype.id }, data: { status: "ARCHIVED" } });
  await db.hostedRoute.updateMany({ where: { project: { prototypeId: prototype.id } }, data: { status: "INACTIVE" } });
  const archived = await db.prototype.update({ where: { id: prototype.id }, data: { status: "ARCHIVED", publishedAt: null } });
  return NextResponse.json({ data: archived });
}
