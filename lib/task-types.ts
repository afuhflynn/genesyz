export type TaskFocus =
  | "ALL"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "OVERDUE";

import type { TaskItem, TaskList, TaskPriority, TaskStatus, TaskMilestone } from "@/lib/api-client";

export type TaskDueFilter = "ALL" | "OVERDUE" | "DUE_SOON" | "NO_DATE";

export interface TaskFilters {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assigneeId: string;
  labelId: string;
  milestoneId: string;
  experimentId: string;
  due: TaskDueFilter;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: "ALL",
  priority: "ALL",
  assigneeId: "ALL",
  labelId: "ALL",
  milestoneId: "ALL",
  experimentId: "ALL",
  due: "ALL",
};

export function filterTaskLists(lists: TaskList[], filters: TaskFilters): TaskList[] {
  return lists.map((list) => ({
    ...list,
    tasks: list.tasks.filter((task) => taskMatchesFilters(task, filters)),
  }));
}

export function taskMatchesFilters(task: TaskItem, filters: TaskFilters): boolean {
  if (filters.status !== "ALL" && task.status !== filters.status) return false;
  if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
  if (filters.assigneeId !== "ALL" && !task.assignees?.some((assignee) => assignee.userId === filters.assigneeId)) return false;
  if (filters.labelId !== "ALL" && !task.labels?.some((label) => label.label.id === filters.labelId)) return false;
  if (filters.milestoneId !== "ALL" && (filters.milestoneId === "NONE" ? task.milestoneId !== null : task.milestoneId !== filters.milestoneId)) return false;
  if (filters.experimentId !== "ALL" && (filters.experimentId === "NONE" ? !task.experiment : task.experiment?.id !== filters.experimentId)) return false;
  if (filters.due === "NO_DATE" && task.deadline) return false;
  if (filters.due === "OVERDUE" && (task.status === "DONE" || !task.deadline || new Date(task.deadline).getTime() >= Date.now())) return false;
  if (filters.due === "DUE_SOON") {
    if (task.status === "DONE" || !task.deadline) return false;
    const due = new Date(task.deadline).getTime();
    const now = Date.now();
    if (due < now || due > now + 7 * 24 * 60 * 60 * 1000) return false;
  }
  return true;
}
