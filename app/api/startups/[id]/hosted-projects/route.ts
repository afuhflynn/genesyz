import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const access = await checkStartupAccess(id, "view_startup");
  if (!access.hasAccess || !access.startupId) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const projects = await db.hostedProject.findMany({
    where: { startupId: access.startupId },
    include: {
      route: true,
      activeRelease: { select: { id: true, version: true, status: true, promotedAt: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ data: projects });
}
