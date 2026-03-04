"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTask, useUpdateTask } from "@/hooks";
import type { TaskItem } from "@/lib/api-client";

interface TaskDetailSheetProps {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: string;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  startupId,
}: TaskDetailSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDeadline(
        task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd") : "",
      );
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!task || !title.trim()) return;

    const normalizedDeadline = deadline.trim();
    const deadlineValue = normalizedDeadline
      ? new Date(`${normalizedDeadline}T00:00:00.000Z`)
      : null;

    if (
      normalizedDeadline &&
      normalizedDeadline.trim() &&
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

    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;

    await deleteTask.mutateAsync({
      startupId,
      taskId: task.id,
    });

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="task-deadline">Deadline</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {task?.deadline && (
            <div className="text-sm text-muted-foreground">
              Created: {format(new Date(task.createdAt), "MMM d, yyyy")}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateTask.isPending || !title.trim()}
              className="flex-1"
            >
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
