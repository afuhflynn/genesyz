import { TaskPriority } from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

const CreateTasksSchema = z.object({
  tasks: z.array(z.object({
    listId: z.string().min(1),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.NONE),
    deadline: z.string().datetime().nullable().optional(),
    assigneeIds: z.array(z.string().min(1)).default([]),
    labelIds: z.array(z.string().min(1)).default([]),
    milestoneId: z.string().min(1).nullable().optional(),
  })).min(1).max(30),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; experimentId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: startupIdOrSlug, experimentId } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "manage_tasks");
    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }

    const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const parsed = CreateTasksSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid task payload", details: parsed.error.flatten() }, { status: 400 });

    const startup = await db.startup.findUnique({ where: { id: access.startupId }, select: { id: true, userId: true } });
    const experiment = await db.growthExperiment.findFirst({ where: { id: experimentId, startupId: access.startupId }, select: { id: true } });
    if (!startup || !experiment) return NextResponse.json({ error: "Experiment not found" }, { status: 404 });

    const input = parsed.data.tasks;
    const listIds = [...new Set(input.map((task) => task.listId))];
    const labelIds = [...new Set(input.flatMap((task) => task.labelIds))];
    const milestoneIds = [...new Set(input.flatMap((task) => task.milestoneId ? [task.milestoneId] : []))];
    const userIds = [...new Set(input.flatMap((task) => task.assigneeIds))];
    const [lists, labels, milestones, members] = await Promise.all([
      db.taskList.findMany({ where: { startupId: startup.id, id: { in: listIds } }, select: { id: true } }),
      db.taskLabel.findMany({ where: { startupId: startup.id, id: { in: labelIds } }, select: { id: true } }),
      db.taskMilestone.findMany({ where: { startupId: startup.id, id: { in: milestoneIds }, archived: false }, select: { id: true } }),
      db.startupMember.findMany({ where: { startupId: startup.id, userId: { in: userIds } }, select: { userId: true } }),
    ]);
    const allowedUsers = new Set(members.map((member) => member.userId));
    allowedUsers.add(startup.userId);
    if (lists.length !== listIds.length || labels.length !== labelIds.length || milestones.length !== milestoneIds.length || userIds.some((userId) => !allowedUsers.has(userId))) {
      return NextResponse.json({ error: "One or more task relations do not belong to this startup" }, { status: 400 });
    }

    const created = await db.$transaction(async (tx) => {
      const results = [];
      for (const task of input) {
        const last = await tx.task.findFirst({ where: { startupId: startup.id, listId: task.listId, status: "TODO" }, orderBy: { position: "desc" }, select: { position: true } });
        results.push(await tx.task.create({
          data: {
            startupId: startup.id,
            experimentId: experiment.id,
            listId: task.listId,
            title: task.title,
            description: task.description || null,
            priority: task.priority,
            deadline: task.deadline ? new Date(task.deadline) : null,
            position: (last?.position ?? -1) + 1,
            milestoneId: task.milestoneId || null,
            assignees: task.assigneeIds.length ? { create: task.assigneeIds.map((userId) => ({ userId })) } : undefined,
            labels: task.labelIds.length ? { create: task.labelIds.map((labelId) => ({ labelId })) } : undefined,
          },
          include: { assignees: { include: { user: { select: { id: true, name: true, image: true } } } }, labels: { include: { label: true } }, milestone: true, experiment: { select: { id: true, title: true, status: true, conclusion: true } } },
        }));
      }
      return results;
    });

    return NextResponse.json({ data: { tasks: created } }, { status: 201 });
  } catch (error) {
    console.error("[GROWTH_EXPERIMENT_TASKS_POST]", error);
    return NextResponse.json({ error: "Unable to create experiment tasks." }, { status: 500 });
  }
}
