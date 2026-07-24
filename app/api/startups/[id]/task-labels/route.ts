import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkStartupAccess,
} from "@/lib/startup-permissions";

const CreateLabelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const DeleteLabelSchema = z.object({
  labelId: z.string().min(1),
});

async function getStartupForUser(startupIdOrSlug: string) {
  const access = await checkStartupAccess(startupIdOrSlug, "manage_tasks");
  if (!access.hasAccess || !access.startupId) return null;
  return db.startup.findUnique({
    where: { id: access.startupId },
    select: { id: true },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug);
  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const labels = await db.taskLabel.findMany({
    where: { startupId: startup.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: labels });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug);
  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const parsed = CreateLabelSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.taskLabel.findUnique({
    where: { startupId_name: { startupId: startup.id, name: parsed.data.name } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Label with this name already exists" },
      { status: 409 },
    );
  }

  const label = await db.taskLabel.create({
    data: {
      startupId: startup.id,
      name: parsed.data.name,
      color: parsed.data.color ?? "#6366f1",
    },
  });

  return NextResponse.json({ data: label }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug);
  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const parsed = DeleteLabelSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await db.taskLabel.deleteMany({
    where: { id: parsed.data.labelId, startupId: startup.id },
  });

  return NextResponse.json({ success: true });
}
