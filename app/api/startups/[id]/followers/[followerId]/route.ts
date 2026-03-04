import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; followerId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, followerId } = await params;

  const access = await checkStartupAccess(id, "manage_team");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const follower = await db.startupFollower.findFirst({
    where: {
      id: followerId,
      startupId: startup.id,
    },
  });

  if (!follower) {
    return NextResponse.json({ error: "Follower not found" }, { status: 404 });
  }

  await db.startupFollower.delete({
    where: { id: followerId },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.follower.removed",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        followerEmail: follower.email,
        followerName: follower.name,
      },
    },
  });

  return NextResponse.json({ success: true });
}
