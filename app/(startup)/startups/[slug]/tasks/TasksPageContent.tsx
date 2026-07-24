"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Columns3,
  CircleDot,
  List,
  ListTodo,
} from "lucide-react";
import { TaskBoard } from "@/components/startups/TaskBoard";
import { TaskFilters } from "@/components/startups/TaskFilters";
import { TaskListView } from "@/components/startups/TaskListView";
import { TaskMilestonesPanel } from "@/components/startups/TaskMilestonesPanel";
import { TaskSidePanel } from "@/components/startups/TaskSidePanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStartup, useTaskLists, useTaskMilestones } from "@/hooks";
import type { TaskItem, TaskList } from "@/lib/api-client";
import { DEFAULT_TASK_FILTERS, type TaskFilters as TaskFiltersState, type TaskFocus } from "@/lib/task-types";
import { cn } from "@/lib/utils";

interface TasksPageContentProps {
  slug: string;
}

type ViewMode = "kanban" | "list" | "milestones";

export function TasksPageContent({ slug }: TasksPageContentProps) {
  const { data: startup, isLoading: startupLoading } = useStartup(slug);
  const { data: taskListsData, isLoading: tasksLoading } = useTaskLists(
    startup?.id ?? "",
  );
  const { data: milestonesData, isLoading: milestonesLoading } = useTaskMilestones(startup?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [taskFocus, setTaskFocus] = useState<TaskFocus>("ALL");
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_TASK_FILTERS);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const lists: TaskList[] = taskListsData?.data?.lists ?? [];
  const tasks = lists.flatMap((list) => list.tasks);
  const overdueTasks = tasks.filter(
    (task) =>
      task.status !== "DONE" &&
      task.deadline &&
      new Date(task.deadline).getTime() < Date.now(),
  );
  const completedTasks = tasks.filter((task) => task.status === "DONE");
  const completionRate = tasks.length
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const focusCards = [
    {
      focus: "ALL" as const,
      label: "Total tasks",
      value: tasks.length,
      detail: `${completionRate}% complete`,
      icon: ListTodo,
      tone: "text-foreground",
    },
    {
      focus: "IN_PROGRESS" as const,
      label: "In progress",
      value: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      detail: "Active work",
      icon: CircleDot,
      tone: "text-blue-600",
    },
    {
      focus: "BLOCKED" as const,
      label: "Blocked",
      value: tasks.filter((task) => task.status === "BLOCKED").length,
      detail: "Needs attention",
      icon: Ban,
      tone: "text-red-600",
    },
    {
      focus: "DONE" as const,
      label: "Completed",
      value: completedTasks.length,
      detail: "Shipped work",
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      focus: "OVERDUE" as const,
      label: "Overdue",
      value: overdueTasks.length,
      detail: "Due dates passed",
      icon: AlertTriangle,
      tone: "text-amber-600",
    },
  ];

  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setPanelOpen(true);
  };

  const handleTaskUpdated = () => {
    setSelectedTask(null);
  };

  const handleFocusChange = (focus: TaskFocus) => {
    setTaskFocus(focus);
    setViewMode("list");
  };

  if (startupLoading || tasksLoading || milestonesLoading) {
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

  if (!startup) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Startup not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("kanban")}
            className={cn(
              "h-8 px-3",
              viewMode === "kanban" && "bg-muted font-medium",
            )}
          >
            <Columns3 className="mr-1.5 h-4 w-4" />
            Board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("milestones")}
            className={cn("h-8 px-3", viewMode === "milestones" && "bg-muted font-medium")}
          >
            Milestones
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "h-8 px-3",
              viewMode === "list" && "bg-muted font-medium",
            )}
          >
            <List className="mr-1.5 h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {focusCards.map((card) => {
          const Icon = card.icon;
          const selected = taskFocus === card.focus;

          return (
            <button
              key={card.focus}
              type="button"
              onClick={() => handleFocusChange(card.focus)}
              className="text-left"
              aria-pressed={selected}
            >
              <Card
                className={cn(
                  "h-full transition-colors hover:border-primary/50",
                  selected && "border-primary bg-primary/5",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {card.label}
                    </span>
                    <Icon className={cn("h-4 w-4", card.tone)} />
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <TaskFilters
        lists={lists}
        milestones={milestonesData?.data ?? []}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_TASK_FILTERS)}
      />

      {viewMode === "kanban" ? (
        <TaskBoard startupId={startup.id} filters={filters} />
      ) : viewMode === "list" ? (
        <TaskListView
          key={taskFocus}
          lists={lists}
          filters={filters}
          focusFilter={taskFocus}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <TaskMilestonesPanel startupId={startup.id} milestones={milestonesData?.data ?? []} />
      )}

      <TaskSidePanel
        task={selectedTask}
        lists={lists}
        startupId={startup.id}
        milestones={milestonesData?.data ?? []}
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setSelectedTask(null);
        }}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
