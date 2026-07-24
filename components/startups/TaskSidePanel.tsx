"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Flag,
  Tag,
  Trash2,
  UserPlus,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  useUpdateTask,
  useDeleteTask,
  useTaskLabels,
  useCreateTaskLabel,
  useTeamMembers,
} from "@/hooks";
import type { TaskItem, TaskPriority, TaskList, TaskLabel, StartupMember, TaskMilestone } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> =
  {
    NONE: { label: "None", color: "text-muted-foreground" },
    LOW: { label: "Low", color: "text-blue-500" },
    MEDIUM: { label: "Medium", color: "text-yellow-500" },
    HIGH: { label: "High", color: "text-orange-500" },
    URGENT: { label: "Urgent", color: "text-red-500" },
  };

interface TaskSidePanelProps {
  task: TaskItem | null;
  lists: TaskList[];
  startupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  milestones?: TaskMilestone[];
}

export function TaskSidePanel({
  task,
  lists,
  startupId,
  open,
  onOpenChange,
  onTaskUpdated,
  milestones = [],
}: TaskSidePanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NONE");
  const [listId, setListId] = useState("");
  const [milestoneId, setMilestoneId] = useState("none");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: labelsData } = useTaskLabels(startupId);
  const { data: membersData } = useTeamMembers(startupId);
  const createLabel = useCreateTaskLabel();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setListId(task.listId);
      setMilestoneId(task.milestoneId ?? "none");
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setSelectedAssigneeIds(
        task.assignees?.map((a) => a.userId) ?? [],
      );
      setSelectedLabelIds(
        task.labels?.map((l) => l.label.id) ?? [],
      );
    }
  }, [task]);

  if (!task) return null;

  const labels = labelsData?.data ?? [];
  const members = membersData?.data ?? [];

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({
        startupId,
        data: {
          taskId: task.id,
          title,
            description: description || undefined,
          priority,
          deadline: deadline ? deadline.toISOString() : null,
          assigneeIds: selectedAssigneeIds,
          labelIds: selectedLabelIds,
          milestoneId: milestoneId === "none" ? null : milestoneId,
        },
      });
      onTaskUpdated();
      toast.success("Task saved");
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({ startupId, taskId: task.id });
      setShowDeleteDialog(false);
      onOpenChange(false);
      onTaskUpdated();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      await createLabel.mutateAsync({
        startupId,
        data: { name: newLabelName.trim() },
      });
      setNewLabelName("");
    } catch {
      toast.error("Failed to create label");
    }
  };

  const isDirty =
    title !== task.title ||
    description !== (task.description ?? "") ||
    priority !== task.priority ||
    listId !== task.listId ||
    (deadline?.toISOString() ?? null) !== task.deadline ||
    JSON.stringify(selectedAssigneeIds) !==
      JSON.stringify(task.assignees?.map((a) => a.userId) ?? []) ||
    JSON.stringify(selectedLabelIds) !==
      JSON.stringify(task.labels?.map((l) => l.label.id) ?? []) ||
    milestoneId !== (task.milestoneId ?? "none");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <SheetTitle className="text-lg font-semibold">
              Edit Task
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                placeholder="Task title"
              />
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select list" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Milestone</Label>
              <Select value={milestoneId} onValueChange={setMilestoneId}>
                <SelectTrigger><SelectValue placeholder="No milestone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No milestone</SelectItem>
                  {milestones.map((milestone) => <SelectItem key={milestone.id} value={milestone.id}>{milestone.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {task.experiment && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                <p className="font-medium text-primary">Growth experiment</p>
                <p className="mt-1 text-muted-foreground">{task.experiment.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{task.experiment.status} · {task.experiment.conclusion}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Priority</span>
              </div>
              <div className="flex gap-2">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        priority === p
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Due date</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {deadline ? (
                      format(deadline, "PPP")
                    ) : (
                      <span className="text-muted-foreground">
                        Set due date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assignees</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {selectedAssigneeIds.length > 0
                      ? `${selectedAssigneeIds.length} assigned`
                      : "Assign members"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandList>
                      <CommandEmpty>No members found</CommandEmpty>
                      <CommandGroup>
                        {members.map((member) => (
                          <CommandItem
                            key={member.id}
                            onSelect={() => {
                              setSelectedAssigneeIds((prev) =>
                                prev.includes(member.user.id)
                                  ? prev.filter(
                                      (id) => id !== member.user.id,
                                    )
                                  : [...prev, member.user.id],
                              );
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                selectedAssigneeIds.includes(
                                  member.user.id,
                                )
                                  ? "bg-primary border-primary"
                                  : "opacity-50",
                              )}
                            >
                              {selectedAssigneeIds.includes(
                                member.user.id,
                              ) && (
                                <span className="text-primary-foreground text-xs">
                                  ✓
                                </span>
                              )}
                            </div>
                            {member.user.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedAssigneeIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {members
                    .filter((m) =>
                      selectedAssigneeIds.includes(m.user.id),
                    )
                    .map((m) => (
                      <Badge key={m.id} variant="secondary">
                        {m.user.name}
                        <button
                          type="button"
                          className="ml-1"
                          onClick={() =>
                            setSelectedAssigneeIds((prev) =>
                              prev.filter((id) => id !== m.user.id),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Labels</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label: TaskLabel) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() =>
                        setSelectedLabelIds((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== label.id)
                            : [...prev, label.id],
                        )
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-all",
                        isSelected
                          ? "ring-2 ring-offset-1"
                          : "opacity-60 hover:opacity-100",
                      )}
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                        outlineColor: isSelected ? label.color : undefined,
                      } as React.CSSProperties}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="New label name..."
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateLabel();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim() || createLabel.isPending}
                >
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={5}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDirty || updateTask.isPending}
              >
                {updateTask.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
