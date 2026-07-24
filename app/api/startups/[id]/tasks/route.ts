import { TaskPriority, TaskStatus } from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkStartupAccess,
  type StartupPermission,
} from "@/lib/startup-permissions";

const CreateListSchema = z.object({
  action: z.literal("create_list"),
  name: z.string().trim().min(1).max(80),
});

const CreateTaskSchema = z.object({
  action: z.literal("create_task"),
  listId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  deadline: z.string().datetime().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
  labelIds: z.array(z.string().min(1)).optional(),
  milestoneId: z.string().min(1).nullable().optional(),
  experimentId: z.string().min(1).nullable().optional(),
});

const RenameListSchema = z.object({
  action: z.literal("rename_list"),
  listId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
});

const ReorderListsSchema = z.object({
  action: z.literal("reorder_lists"),
  lists: z.array(
    z.object({
      listId: z.string().min(1),
      position: z.number().int().min(0),
    }),
  ),
});

const UpdateTaskSchema = z.object({
  action: z.literal("update_task"),
  taskId: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  deadline: z.string().datetime().nullable().optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
  labelIds: z.array(z.string().min(1)).optional(),
  milestoneId: z.string().min(1).nullable().optional(),
  experimentId: z.string().min(1).nullable().optional(),
});

const UpdateAssigneesSchema = z.object({
  action: z.literal("update_assignees"),
  taskId: z.string().min(1),
  userIds: z.array(z.string().min(1)),
});

const UpdateLabelsSchema = z.object({
  action: z.literal("update_labels"),
  taskId: z.string().min(1),
  labelIds: z.array(z.string().min(1)),
});

const MoveTaskSchema = z.object({
  action: z.literal("move_task"),
  taskId: z.string().min(1),
  listId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
  position: z.number().int().min(0).optional(),
});

const DeleteListSchema = z.object({
  action: z.literal("delete_list"),
  listId: z.string().min(1),
});

const DeleteTaskSchema = z.object({
  action: z.literal("delete_task"),
  taskId: z.string().min(1),
});

const PostSchema = z.union([CreateListSchema, CreateTaskSchema]);
const PatchSchema = z.union([
  RenameListSchema,
  ReorderListsSchema,
  UpdateTaskSchema,
  UpdateAssigneesSchema,
  UpdateLabelsSchema,
  MoveTaskSchema,
]);
const DeleteSchema = z.union([DeleteListSchema, DeleteTaskSchema]);

async function getStartupForUser(
  startupIdOrSlug: string,
  permission: StartupPermission,
) {
  const access = await checkStartupAccess(startupIdOrSlug, permission);

  if (!access.hasAccess || !access.startupId) {
    return null;
  }

  return db.startup.findUnique({
    where: { id: access.startupId },
    select: { id: true },
  });
}

async function validateTaskRelations(
  startupId: string,
  userIds: string[] = [],
  labelIds: string[] = [],
  milestoneId?: string | null,
  experimentId?: string | null,
) {
  const [startup, members, labels, milestone, experiment] = await Promise.all([
    db.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    }),
    userIds.length
      ? db.startupMember.findMany({
          where: { startupId, userId: { in: userIds } },
          select: { userId: true },
        })
      : Promise.resolve([] as { userId: string }[]),
    labelIds.length
      ? db.taskLabel.count({ where: { startupId, id: { in: labelIds } } })
      : Promise.resolve(0),
    milestoneId
      ? db.taskMilestone.count({ where: { id: milestoneId, startupId, archived: false } })
      : Promise.resolve(1),
    experimentId
      ? db.growthExperiment.count({ where: { id: experimentId, startupId } })
      : Promise.resolve(1),
  ]);

  const allowedUserIds = new Set(members.map((member) => member.userId));
  if (startup?.userId) allowedUserIds.add(startup.userId);
  return (
    userIds.every((userId) => allowedUserIds.has(userId)) &&
    labels === new Set(labelIds).size && milestone === 1 && experiment === 1
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug, "view_startup");

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam
    ? z.nativeEnum(TaskStatus).safeParse(statusParam)
    : null;

  const lists = await db.taskList.findMany({
    where: { startupId: startup.id },
    orderBy: { position: "asc" },
    include: {
      tasks: {
        where: {
          ...(status?.success ? { status: status.data } : {}),
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        include: {
          assignees: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          milestone: true,
          experiment: { select: { id: true, title: true, status: true, conclusion: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: { lists } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug, "manage_tasks");

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const parsed = PostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.action === "create_list") {
    const last = await db.taskList.findFirst({
      where: { startupId: startup.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const list = await db.taskList.create({
      data: {
        startupId: startup.id,
        name: parsed.data.name,
        position: (last?.position ?? -1) + 1,
      },
    });

    return NextResponse.json({ data: list }, { status: 201 });
  }

  const list = await db.taskList.findFirst({
    where: { id: parsed.data.listId, startupId: startup.id },
    select: { id: true },
  });

  if (!list) {
    return NextResponse.json({ error: "Task list not found" }, { status: 404 });
  }

  if (
    !(await validateTaskRelations(
      startup.id,
      parsed.data.assigneeIds,
      parsed.data.labelIds,
      parsed.data.milestoneId,
      parsed.data.experimentId,
    ))
  ) {
    return NextResponse.json(
      {
        error: "One or more assignees or labels do not belong to this startup",
      },
      { status: 400 },
    );
  }

  const lastTask = await db.task.findFirst({
    where: {
      startupId: startup.id,
      listId: parsed.data.listId,
      milestoneId: parsed.data.milestoneId ?? null,
      status: parsed.data.status ?? "TODO",
    },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const task = await db.task.create({
    data: {
      startupId: startup.id,
      listId: parsed.data.listId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority ?? "NONE",
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      status: parsed.data.status ?? "TODO",
      position: (lastTask?.position ?? -1) + 1,
      completedAt: parsed.data.status === "DONE" ? new Date() : null,
      experimentId: parsed.data.experimentId,
      ...(parsed.data.assigneeIds?.length
        ? {
            assignees: {
              create: parsed.data.assigneeIds.map((userId) => ({ userId })),
            },
          }
        : {}),
      ...(parsed.data.labelIds?.length
        ? {
            labels: {
              create: parsed.data.labelIds.map((labelId) => ({ labelId })),
            },
          }
        : {}),
    },
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      labels: {
        include: { label: true },
      },
      milestone: true,
      experiment: { select: { id: true, title: true, status: true, conclusion: true } },
    },
  });

  return NextResponse.json({ data: task }, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug, "manage_tasks");

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const parsed = PatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.action === "rename_list") {
    const updated = await db.taskList.updateMany({
      where: { id: parsed.data.listId, startupId: startup.id },
      data: { name: parsed.data.name },
    });

    if (!updated.count) {
      return NextResponse.json(
        { error: "Task list not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "reorder_lists") {
    await db.$transaction(
      parsed.data.lists.map((item) =>
        db.taskList.updateMany({
          where: { id: item.listId, startupId: startup.id },
          data: { position: item.position },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "update_task") {
    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      updateData.description = parsed.data.description || null;
    if (parsed.data.priority !== undefined)
      updateData.priority = parsed.data.priority;
    if (parsed.data.deadline !== undefined) {
      updateData.deadline = parsed.data.deadline
        ? new Date(parsed.data.deadline)
        : null;
    }
    if (parsed.data.milestoneId !== undefined) {
      updateData.milestoneId = parsed.data.milestoneId;
    }
    if (parsed.data.experimentId !== undefined) {
      updateData.experimentId = parsed.data.experimentId;
    }

    const taskId = parsed.data.taskId;

    const existingTask = await db.task.findFirst({
      where: { id: taskId, startupId: startup.id },
      select: { id: true },
    });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (
      !(await validateTaskRelations(
        startup.id,
        parsed.data.assigneeIds,
        parsed.data.labelIds,
        parsed.data.milestoneId,
        parsed.data.experimentId,
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "One or more assignees or labels do not belong to this startup",
        },
        { status: 400 },
      );
    }

    await db.task.update({
      where: { id: taskId },
      data: updateData,
    });

    if (parsed.data.assigneeIds !== undefined) {
      await db.taskAssignee.deleteMany({ where: { taskId } });
      if (parsed.data.assigneeIds.length > 0) {
        await db.taskAssignee.createMany({
          data: parsed.data.assigneeIds.map((userId) => ({
            taskId,
            userId,
          })),
        });
      }
    }

    if (parsed.data.labelIds !== undefined) {
      await db.taskTaskLabel.deleteMany({ where: { taskId } });
      if (parsed.data.labelIds.length > 0) {
        await db.taskTaskLabel.createMany({
          data: parsed.data.labelIds.map((labelId) => ({
            taskId,
            labelId,
          })),
        });
      }
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        labels: {
          include: { label: true },
        },
        milestone: true,
        experiment: { select: { id: true, title: true, status: true, conclusion: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  }

  if (parsed.data.action === "update_assignees") {
    const data = parsed.data as unknown as {
      taskId: string;
      userIds: string[];
    };
    const taskId = data.taskId;
    const task = await db.task.findFirst({
      where: { id: taskId, startupId: startup.id },
      select: { id: true },
    });
    if (!task || !(await validateTaskRelations(startup.id, data.userIds))) {
      return NextResponse.json(
        { error: "Task or assignee not found" },
        { status: 404 },
      );
    }
    await db.taskAssignee.deleteMany({ where: { taskId } });
    if (data.userIds.length > 0) {
      await db.taskAssignee.createMany({
        data: data.userIds.map((userId) => ({ taskId, userId })),
      });
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "update_labels") {
    const data = parsed.data as unknown as {
      taskId: string;
      labelIds: string[];
    };
    const taskId = data.taskId;
    const task = await db.task.findFirst({
      where: { id: taskId, startupId: startup.id },
      select: { id: true },
    });
    if (
      !task ||
      !(await validateTaskRelations(startup.id, [], data.labelIds))
    ) {
      return NextResponse.json(
        { error: "Task or label not found" },
        { status: 404 },
      );
    }
    await db.taskTaskLabel.deleteMany({ where: { taskId } });
    if (data.labelIds.length > 0) {
      await db.taskTaskLabel.createMany({
        data: data.labelIds.map((labelId) => ({ taskId, labelId })),
      });
    }
    return NextResponse.json({ success: true });
  }

  const targetList = await db.taskList.findFirst({
    where: { id: parsed.data.listId, startupId: startup.id },
    select: { id: true },
  });

  if (!targetList) {
    return NextResponse.json(
      { error: "Target list not found" },
      { status: 404 },
    );
  }

  const task = await db.task.findFirst({
    where: { id: parsed.data.taskId, startupId: startup.id },
    select: { id: true, status: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  let position = parsed.data.position;
  if (position === undefined) {
    const lastTask = await db.task.findFirst({
      where: {
        startupId: startup.id,
        listId: parsed.data.listId,
        status: parsed.data.status,
      },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    position = (lastTask?.position ?? -1) + 1;
  }

  await db.task.update({
    where: { id: parsed.data.taskId },
    data: {
      listId: parsed.data.listId,
      status: parsed.data.status,
      position,
      completedAt:
        parsed.data.status === "DONE"
          ? task.status === "DONE"
            ? undefined
            : new Date()
          : null,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug, "manage_tasks");

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const parsed = DeleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.action === "delete_list") {
    await db.taskList.deleteMany({
      where: { id: parsed.data.listId, startupId: startup.id },
    });
    return NextResponse.json({ success: true });
  }

  await db.task.deleteMany({
    where: { id: parsed.data.taskId, startupId: startup.id },
  });

  return NextResponse.json({ success: true });
}
