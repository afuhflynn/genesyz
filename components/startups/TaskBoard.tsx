"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  GripVertical,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type TaskItem,
  type TaskList,
  type TaskStatus,
  useCreateTask,
  useCreateTaskList,
  useDeleteTask,
  useDeleteTaskList,
  useMoveTask,
  useRenameTaskList,
  useTaskLists,
  useUpdateTask,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

const STATUSES = [
  { id: "TODO", label: "To Do", icon: Circle },
  { id: "IN_PROGRESS", label: "In Progress", icon: Clock3 },
  { id: "BLOCKED", label: "Blocked", icon: XCircle },
  { id: "DONE", label: "Done", icon: CheckCircle2 },
] as const;

function TaskCard({
  startupId,
  task,
  onView,
  onDelete,
  isExpanded = false,
}: {
  startupId: string;
  task: TaskItem;
  onView: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
  isExpanded?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const updateTask = useUpdateTask();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [deadline, setDeadline] = useState(
    task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd") : "",
  );

  useEffect(() => {
    if (!isExpanded) return;

    setTitle(task.title);
    setDescription(task.description || "");
    setDeadline(
      task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd") : "",
    );
  }, [isExpanded, task.title, task.description, task.deadline]);

  const handleSave = async () => {
    if (!title.trim()) return;

    const normalizedDeadline = deadline.trim();
    const deadlineValue = normalizedDeadline
      ? new Date(`${normalizedDeadline}T00:00:00.000Z`)
      : null;

    if (
      normalizedDeadline &&
      deadlineValue &&
      Number.isNaN(deadlineValue.getTime())
    ) {
      return;
    }

    await updateTask.mutateAsync({
      startupId,
      data: {
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadlineValue ? deadlineValue.toISOString() : null,
      },
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn("touch-none", isExpanded && "ring-1 ring-primary/30")}
    >
      <CardContent
        className={cn("p-3 space-y-2", isDragging && "bg-muted opacity-60")}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <button
              className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="min-w-0 cursor-pointer text-left"
              onClick={() => onView(task)}
            >
              <p className="font-medium text-sm truncate">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </button>
          </div>
          {!isDragging && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.deadline), "MMM d, yyyy")}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Task title"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a description..."
                className="min-h-[90px]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Created: {format(new Date(task.createdAt), "MMM d, yyyy")}
            </p>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateTask.isPending || !title.trim()}
              >
                {updateTask.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Column({
  startupId,
  listId,
  status,
  tasks,
  onViewTask,
  onDeleteTask,
  expandedTaskId,
}: {
  startupId: string;
  listId: string;
  status: TaskStatus;
  tasks: TaskItem[];
  onViewTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  expandedTaskId: string | null;
}) {
  const droppableId = `${listId}:${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-3 min-h-[170px] ${isOver ? "bg-muted/60" : "bg-muted/20"}`}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              startupId={startupId}
              task={task}
              onView={onViewTask}
              onDelete={onDeleteTask}
              isExpanded={expandedTaskId === task.id}
            />
          ))}
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground">No tasks</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskBoard({ startupId }: { startupId: string }) {
  const { data: taskListsData, isLoading } = useTaskLists(startupId);
  const createTaskList = useCreateTaskList();
  const renameTaskList = useRenameTaskList();
  const deleteTaskList = useDeleteTaskList();
  const createTask = useCreateTask();
  const moveTask = useMoveTask();
  const deleteTask = useDeleteTask();

  const lists: TaskList[] = taskListsData?.data?.lists || [];

  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskListId, setTaskListId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameListId, setRenameListId] = useState("");
  const [renameListName, setRenameListName] = useState("");

  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const tasksById = useMemo(() => {
    const map = new Map<string, TaskItem>();
    for (const list of lists) {
      for (const task of list.tasks) {
        map.set(task.id, task);
      }
    }
    return map;
  }, [lists]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    await createTaskList.mutateAsync({
      startupId,
      data: { name: newListName },
    });

    setNewListName("");
    setIsListDialogOpen(false);
  };

  const handleRenameList = async () => {
    if (!renameListId || !renameListName.trim()) return;

    await renameTaskList.mutateAsync({
      startupId,
      data: { listId: renameListId, name: renameListName.trim() },
    });

    setIsRenameDialogOpen(false);
    setRenameListId("");
    setRenameListName("");
  };

  const openRenameDialog = (listId: string, currentName: string) => {
    setRenameListId(listId);
    setRenameListName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteList = async () => {
    if (!deleteListId) return;

    await deleteTaskList.mutateAsync({
      startupId,
      listId: deleteListId,
    });

    setDeleteListId(null);
  };

  const handleCreateTask = async () => {
    if (!taskListId || !taskTitle.trim()) return;

    await createTask.mutateAsync({
      startupId,
      data: {
        listId: taskListId,
        title: taskTitle,
        description: taskDescription || undefined,
        deadline: taskDeadline
          ? new Date(taskDeadline).toISOString()
          : undefined,
        status: "TODO",
      },
    });

    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setTaskListId("");
    setIsTaskDialogOpen(false);
  };

  const openCreateTaskForList = (listId: string) => {
    setTaskListId(listId);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    await deleteTask.mutateAsync({
      startupId,
      taskId: deleteTaskId,
    });

    setDeleteTaskId(null);
  };

  useEffect(() => {
    if (!expandedTaskId) return;
    if (tasksById.has(expandedTaskId)) return;
    setExpandedTaskId(null);
  }, [expandedTaskId, tasksById]);

  const openTaskDetail = (task: TaskItem) => {
    setExpandedTaskId((currentId) => (currentId === task.id ? null : task.id));
  };

  const getTasksByStatus = (list: TaskList, status: TaskStatus) =>
    list.tasks.filter((task) => task.status === status);

  const onDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTask(tasksById.get(taskId) || null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const taskId = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;

    const task = tasksById.get(taskId);
    if (!task) return;

    let targetListId: string | undefined;
    let targetStatus: TaskStatus | undefined;

    if (overId.includes(":")) {
      const [listId, status] = overId.split(":") as [string, TaskStatus];
      targetListId = listId;
      targetStatus = status;
    } else {
      const overTask = tasksById.get(overId);
      if (overTask) {
        targetListId = overTask.listId;
        targetStatus = overTask.status;
      }
    }

    if (!targetListId || !targetStatus) return;

    if (task.listId === targetListId && task.status === targetStatus) {
      return;
    }

    await moveTask.mutateAsync({
      startupId,
      data: {
        taskId,
        listId: targetListId,
        status: targetStatus,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Startup Tasks</h2>
        <div className="flex items-center gap-2">
          <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task List</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="list-name">List name</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Product Launch"
                />
                <Button onClick={handleCreateList} className="w-full">
                  Create List
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="task-list">List</Label>
                <select
                  id="task-list"
                  value={taskListId}
                  onChange={(e) => setTaskListId(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">Select a list</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>

                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                />

                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task details"
                />

                <Label htmlFor="task-deadline">Deadline</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />

                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Task List</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="rename-list-name">List name</Label>
            <Input
              id="rename-list-name"
              value={renameListName}
              onChange={(e) => setRenameListName(e.target.value)}
              placeholder="List name"
            />
            <Button onClick={handleRenameList} className="w-full">
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteListId}
        onOpenChange={() => setDeleteListId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this list? All tasks in this list
              will be deleted as well. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTaskId}
        onOpenChange={() => setDeleteTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No task lists yet. Create your first list to get started.
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="space-y-4">
            {lists.map((list) => (
              <Card key={list.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Add task to list"
                        onClick={() => openCreateTaskForList(list.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRenameDialog(list.id, list.name)}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteListId(list.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {STATUSES.map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <div key={status.id} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <StatusIcon className="h-4 w-4 text-muted-foreground" />
                            {status.label}
                            <span className="text-muted-foreground">
                              ({getTasksByStatus(list, status.id).length})
                            </span>
                          </div>
                          <Column
                            startupId={startupId}
                            listId={list.id}
                            status={status.id}
                            tasks={getTasksByStatus(list, status.id)}
                            onViewTask={openTaskDetail}
                            onDeleteTask={(taskId) => setDeleteTaskId(taskId)}
                            expandedTaskId={expandedTaskId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                startupId={startupId}
                task={activeTask}
                onView={openTaskDetail}
                onDelete={(taskId) => setDeleteTaskId(taskId)}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
