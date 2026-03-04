import { TaskStatus } from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const CreateListSchema = z.object({
  action: z.literal("create_list"),
  name: z.string().trim().min(1).max(80),
});

const CreateTaskSchema = z.object({
  action: z.literal("create_task"),
  listId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  deadline: z.string().datetime().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
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
  deadline: z.string().datetime().nullable().optional(),
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
  MoveTaskSchema,
]);
const DeleteSchema = z.union([DeleteListSchema, DeleteTaskSchema]);

async function getStartupForUser(startupIdOrSlug: string, userId: string) {
  return db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId,
    },
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

  const { id: startupIdOrSlug } = await params;
  const startup = await getStartupForUser(startupIdOrSlug, session.user.id);

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
  const startup = await getStartupForUser(startupIdOrSlug, session.user.id);

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

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

  const lastTask = await db.task.findFirst({
    where: {
      startupId: startup.id,
      listId: parsed.data.listId,
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
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      status: parsed.data.status ?? "TODO",
      position: (lastTask?.position ?? -1) + 1,
      completedAt: parsed.data.status === "DONE" ? new Date() : null,
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
  const startup = await getStartupForUser(startupIdOrSlug, session.user.id);

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

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
      return NextResponse.json({ error: "Task list not found" }, { status: 404 });
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
    const updated = await db.task.updateMany({
      where: { id: parsed.data.taskId, startupId: startup.id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description || null }
          : {}),
        ...(parsed.data.deadline !== undefined
          ? {
              deadline: parsed.data.deadline
                ? new Date(parsed.data.deadline)
                : null,
            }
          : {}),
      },
    });

    if (!updated.count) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  }

  const targetList = await db.taskList.findFirst({
    where: { id: parsed.data.listId, startupId: startup.id },
    select: { id: true },
  });

  if (!targetList) {
    return NextResponse.json({ error: "Target list not found" }, { status: 404 });
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
  const startup = await getStartupForUser(startupIdOrSlug, session.user.id);

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

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
