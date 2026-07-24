import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await checkStartupAccess((await params).id, "view_startup");
  if (!access.hasAccess || !access.startupId)
    return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const prototypes = await db.prototype.findMany({
    where: { startupId: access.startupId },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ data: prototypes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await checkStartupAccess((await params).id, "edit_startup");
  if (!access.hasAccess || !access.startupId)
    return NextResponse.json({ error: "Access denied" }, { status: 403 });

  try {
    await checkWorkspaceCapability(session.user.id, "builder", access.startupId);
    const body = await request.json();
    if (typeof body.html !== "string" || body.html.length === 0 || body.html.length > 2_000_000) {
      return NextResponse.json({ error: "html must be a non-empty document under 2 MB" }, { status: 400 });
    }

    const prototype = await db.prototype.create({
      data: {
        startupId: access.startupId,
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 120) : "Untitled prototype",
        prompt: typeof body.prompt === "string" ? body.prompt.slice(0, 10_000) : undefined,
        html: body.html,
      },
    });
    return NextResponse.json({ data: prototype }, { status: 201 });
  } catch (error) {
    const entitlementResponse = entitlementErrorResponse(error);
    if (entitlementResponse) return entitlementResponse;
    console.error("[PROTOTYPE_CREATE]", error);
    return NextResponse.json({ error: "Failed to save prototype" }, { status: 500 });
  }
}
