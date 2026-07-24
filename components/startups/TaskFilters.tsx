"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TaskList, TaskMilestone } from "@/lib/api-client";
import type { TaskFilters as TaskFiltersState } from "@/lib/task-types";

export function TaskFilters({ lists, milestones, filters, onChange, onClear }: { lists: TaskList[]; milestones: TaskMilestone[]; filters: TaskFiltersState; onChange: (filters: TaskFiltersState) => void; onClear: () => void }) {
  const tasks = lists.flatMap((list) => list.tasks);
  const assignees = Array.from(new Map(tasks.flatMap((task) => task.assignees ?? []).map((assignee) => [assignee.userId, assignee.user])).entries());
  const labels = Array.from(new Map(tasks.flatMap((task) => task.labels ?? []).map((item) => [item.label.id, item.label])).values());
  const experiments = Array.from(new Map(tasks.flatMap((task) => task.experiment ? [task.experiment] : []).map((experiment) => [experiment.id, experiment])).values());
  const active = Object.values(filters).some((value) => value !== "ALL");
  return <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-2">
    <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value as TaskFiltersState["status"] })}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="TODO">To do</SelectItem><SelectItem value="IN_PROGRESS">In progress</SelectItem><SelectItem value="BLOCKED">Blocked</SelectItem><SelectItem value="DONE">Done</SelectItem></SelectContent></Select>
    <Select value={filters.priority} onValueChange={(value) => onChange({ ...filters, priority: value as TaskFiltersState["priority"] })}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="ALL">All priorities</SelectItem><SelectItem value="URGENT">Urgent</SelectItem><SelectItem value="HIGH">High</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="LOW">Low</SelectItem><SelectItem value="NONE">No priority</SelectItem></SelectContent></Select>
    <Select value={filters.assigneeId} onValueChange={(value) => onChange({ ...filters, assigneeId: value })}><SelectTrigger className="w-[145px]"><SelectValue placeholder="Assignee" /></SelectTrigger><SelectContent><SelectItem value="ALL">All assignees</SelectItem>{assignees.map(([id, user]) => <SelectItem key={id} value={id}>{user?.name ?? "Unnamed"}</SelectItem>)}</SelectContent></Select>
    <Select value={filters.labelId} onValueChange={(value) => onChange({ ...filters, labelId: value })}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Label" /></SelectTrigger><SelectContent><SelectItem value="ALL">All labels</SelectItem>{labels.map((label) => <SelectItem key={label.id} value={label.id}>{label.name}</SelectItem>)}</SelectContent></Select>
    <Select value={filters.milestoneId} onValueChange={(value) => onChange({ ...filters, milestoneId: value })}><SelectTrigger className="w-[155px]"><SelectValue placeholder="Milestone" /></SelectTrigger><SelectContent><SelectItem value="ALL">All milestones</SelectItem><SelectItem value="NONE">No milestone</SelectItem>{milestones.map((milestone) => <SelectItem key={milestone.id} value={milestone.id}>{milestone.title}</SelectItem>)}</SelectContent></Select>
    <Select value={filters.experimentId} onValueChange={(value) => onChange({ ...filters, experimentId: value })}><SelectTrigger className="w-[175px]"><SelectValue placeholder="Experiment" /></SelectTrigger><SelectContent><SelectItem value="ALL">All experiments</SelectItem><SelectItem value="NONE">No experiment</SelectItem>{experiments.map((experiment) => <SelectItem key={experiment.id} value={experiment.id}>{experiment.title}</SelectItem>)}</SelectContent></Select>
    <Select value={filters.due} onValueChange={(value) => onChange({ ...filters, due: value as TaskFiltersState["due"] })}><SelectTrigger className="w-[125px]"><SelectValue placeholder="Due date" /></SelectTrigger><SelectContent><SelectItem value="ALL">Any due date</SelectItem><SelectItem value="DUE_SOON">Due soon</SelectItem><SelectItem value="OVERDUE">Overdue</SelectItem><SelectItem value="NO_DATE">No due date</SelectItem></SelectContent></Select>
    {active && <Button variant="ghost" size="sm" onClick={onClear}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Clear filters</Button>}
  </div>;
}
