import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

const CreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  targetDate: z.string().datetime().nullable().optional(),
});

const UpdateSchema = CreateSchema.partial().extend({
  milestoneId: z.string().min(1),
  archived: z.boolean().optional(),
});

async function getStartup(id: string, permission: "view_startup" | "manage_tasks") {
  const access = await checkStartupAccess(id, permission);
  return access.hasAccess && access.startupId ? access.startupId : null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const startupId = await getStartup((await params).id, "view_startup");
  if (!startupId) return NextResponse.json({ error: "Startup not found" }, { status: 404 });

  const milestones = await db.taskMilestone.findMany({
    where: { startupId, archived: false },
    orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { tasks: true } }, tasks: { select: { status: true, deadline: true } } },
  });

  return NextResponse.json({ data: milestones.map(({ tasks, _count, ...milestone }) => {
    const completed = tasks.filter((task) => task.status === "DONE").length;
    const total = _count.tasks;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const overdue = Boolean(milestone.targetDate && milestone.targetDate < new Date() && percent < 100);
    return { ...milestone, progress: { total, completed, percent, overdue } };
  }) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const startupId = await getStartup((await params).id, "manage_tasks");
  if (!startupId) return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);
  const parsed = CreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  const milestone = await db.taskMilestone.create({ data: { startupId, title: parsed.data.title, description: parsed.data.description || null, targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null } });
  return NextResponse.json({ data: milestone }, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const startupId = await getStartup((await params).id, "manage_tasks");
  if (!startupId) return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);
  const parsed = UpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  const { milestoneId, ...data } = parsed.data;
  const existing = await db.taskMilestone.findFirst({ where: { id: milestoneId, startupId } });
  if (!existing) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  const milestone = await db.taskMilestone.update({ where: { id: milestoneId }, data: { ...data, ...(data.targetDate !== undefined ? { targetDate: data.targetDate ? new Date(data.targetDate) : null } : {}) } });
  return NextResponse.json({ data: milestone });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const startupId = await getStartup((await params).id, "manage_tasks");
  if (!startupId) return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);
  const body = z.object({ milestoneId: z.string().min(1) }).safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const deleted = await db.taskMilestone.deleteMany({ where: { id: body.data.milestoneId, startupId } });
  if (!deleted.count) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
