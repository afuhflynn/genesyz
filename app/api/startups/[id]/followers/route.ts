import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { checkStartupAccess } from "@/lib/startup-permissions";

const addFollowerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "manage_team");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
      userId: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const followers = await db.startupFollower.findMany({
    where: { startupId: startup.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: followers });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "manage_team");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = addFollowerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, name } = parsed.data;

  const existingFollower = await db.startupFollower.findUnique({
    where: {
      startupId_email: {
        startupId: startup.id,
        email,
      },
    },
  });

  if (existingFollower) {
    return NextResponse.json(
      { error: "This email is already a follower" },
      { status: 400 },
    );
  }

  const follower = await db.startupFollower.create({
    data: {
      startupId: startup.id,
      email,
      name,
      createdBy: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "startup.follower.added",
      resource: "startup",
      resourceId: startup.id,
      metadata: {
        followerEmail: email,
        followerName: name,
      },
    },
  });

  await inngest.send({
    name: "startup.follower.added",
    data: {
      followerId: follower.id,
      startupId: startup.id,
      startupName: startup.name,
      startupSlug: startup.slug,
      followerEmail: email,
      followerName: name,
      addedByUserId: session.user.id,
    },
  });

  return NextResponse.json({ data: follower }, { status: 201 });
}
