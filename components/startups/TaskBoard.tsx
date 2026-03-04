"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
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
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

const STATUSES = [
  { id: "TODO", label: "To Do", icon: Circle },
  { id: "IN_PROGRESS", label: "In Progress", icon: Clock3 },
  { id: "BLOCKED", label: "Blocked", icon: XCircle },
  { id: "DONE", label: "Done", icon: CheckCircle2 },
] as const;

type TaskStatus = (typeof STATUSES)[number]["id"];

interface TaskItem {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: TaskStatus;
  position: number;
}

interface TaskList {
  id: string;
  name: string;
  position: number;
  tasks: TaskItem[];
}

interface TaskBoardProps {
  startupId: string;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="touch-none"
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <button
              className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.deadline), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Column({
  listId,
  status,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  listId: string;
  status: TaskStatus;
  tasks: TaskItem[];
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
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
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
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

export function TaskBoard({ startupId }: TaskBoardProps) {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskListId, setTaskListId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/startups/${startupId}/applications`);
      if (!res.ok) throw new Error("Failed to load task lists");
      const json = await res.json();
      setLists(json.data?.lists || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startupId]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_list", name: newListName }),
    });

    if (!res.ok) {
      toast.error("Failed to create list");
      return;
    }

    setNewListName("");
    setIsListDialogOpen(false);
    await fetchData();
  };

  const handleRenameList = async (listId: string, name: string) => {
    const value = window.prompt("Rename list", name)?.trim();
    if (!value || value === name) return;

    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rename_list", listId, name: value }),
    });

    if (!res.ok) {
      toast.error("Failed to rename list");
      return;
    }

    await fetchData();
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("Delete this list and all its tasks?")) return;

    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_list", listId }),
    });

    if (!res.ok) {
      toast.error("Failed to delete list");
      return;
    }

    await fetchData();
  };

  const handleCreateTask = async () => {
    if (!taskListId || !taskTitle.trim()) return;

    const payload = {
      action: "create_task",
      listId: taskListId,
      title: taskTitle,
      description: taskDescription || undefined,
      deadline: taskDeadline ? new Date(taskDeadline).toISOString() : undefined,
      status: "TODO",
    };

    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Failed to create task");
      return;
    }

    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setTaskListId("");
    setIsTaskDialogOpen(false);
    await fetchData();
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_task", taskId }),
    });

    if (!res.ok) {
      toast.error("Failed to delete task");
      return;
    }

    await fetchData();
  };

  const handleEditTask = async (task: TaskItem) => {
    const title = window.prompt("Task title", task.title)?.trim();
    if (!title) return;

    const descriptionInput = window.prompt(
      "Description (optional)",
      task.description || "",
    );
    if (descriptionInput === null) return;

    const currentDate = task.deadline
      ? format(new Date(task.deadline), "yyyy-MM-dd")
      : "";
    const deadlineInput = window.prompt(
      "Deadline YYYY-MM-DD (leave empty to clear)",
      currentDate,
    );
    if (deadlineInput === null) return;

    const normalizedDeadline = deadlineInput.trim();
    const deadline = normalizedDeadline
      ? new Date(`${normalizedDeadline}T00:00:00.000Z`)
      : null;

    if (deadline && Number.isNaN(deadline.getTime())) {
      toast.error("Invalid deadline format. Use YYYY-MM-DD");
      return;
    }

    const res = await fetch(`/api/startups/${startupId}/applications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_task",
        taskId: task.id,
        title,
        description: descriptionInput.trim() || null,
        deadline: deadline ? deadline.toISOString() : null,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to update task");
      return;
    }

    await fetchData();
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

    const previous = lists;
    setLists((current) =>
      current.map((list) => {
        const nextTasks = list.tasks.map((item) => {
          if (item.id === taskId) {
            return { ...item, listId: targetListId, status: targetStatus };
          }
          return item;
        });
        return { ...list, tasks: nextTasks };
      }),
    );

    try {
      const res = await fetch(`/api/startups/${startupId}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_task",
          taskId,
          listId: targetListId,
          status: targetStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to move task");
      }

      await fetchData();
    } catch {
      setLists(previous);
      toast.error("Failed to move task");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading tasks...</div>;
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenameList(list.id, list.name)}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteList(list.id)}
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
                            listId={list.id}
                            status={status.id}
                            tasks={getTasksByStatus(list, status.id)}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
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
              <Card className="w-72">
                <CardContent className="p-3 text-sm font-medium">
                  {activeTask.title}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
