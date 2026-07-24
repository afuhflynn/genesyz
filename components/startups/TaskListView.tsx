"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  Flag,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TaskItem,
  TaskList,
  TaskPriority,
  TaskStatus,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DEFAULT_TASK_FILTERS, taskMatchesFilters, type TaskFilters as TaskFiltersState, type TaskFocus } from "@/lib/task-types";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> =
  {
    NONE: { label: "None", color: "text-muted-foreground" },
    LOW: { label: "Low", color: "text-blue-500" },
    MEDIUM: { label: "Medium", color: "text-yellow-500" },
    HIGH: { label: "High", color: "text-orange-500" },
    URGENT: { label: "Urgent", color: "text-red-500" },
  };

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: "Todo", color: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  BLOCKED: { label: "Blocked", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  DONE: { label: "Done", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

type SortField = "title" | "priority" | "status" | "deadline" | "listId";

interface TaskListViewProps {
  lists: TaskList[];
  filters?: TaskFiltersState;
  focusFilter?: TaskFocus;
  onTaskClick: (task: TaskItem) => void;
}

export function TaskListView({ lists, filters = DEFAULT_TASK_FILTERS, focusFilter = "ALL", onTaskClick }: TaskListViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">(
    focusFilter === "IN_PROGRESS" || focusFilter === "BLOCKED" || focusFilter === "DONE"
      ? focusFilter
      : "ALL",
  );
  const [overdueOnly, setOverdueOnly] = useState(focusFilter === "OVERDUE");
  const [listFilter, setListFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortAsc, setSortAsc] = useState(true);

  const tasks = useMemo(() => {
    const all = lists.flatMap((l) =>
      l.tasks.map((t) => ({ ...t, listName: l.name })),
    );

    const filtered = all.filter((t) => {
      if (!taskMatchesFilters(t, filters)) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (listFilter !== "ALL" && t.listId !== listFilter) return false;
      if (
        overdueOnly &&
        (t.status === "DONE" || !t.deadline || new Date(t.deadline).getTime() >= Date.now())
      )
        return false;
      return true;
    });

    const PRIORITY_ORDER: Record<TaskPriority, number> = {
      NONE: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      URGENT: 4,
    };

    const STATUS_ORDER: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 1,
      BLOCKED: 2,
      DONE: 3,
    };

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "deadline":
          cmp = (a.deadline ?? "").localeCompare(b.deadline ?? "");
          break;
        case "listId":
          cmp = (a as unknown as Record<string, string>).listName.localeCompare(
            (b as unknown as Record<string, string>).listName,
          );
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return filtered;
  }, [lists, filters, search, statusFilter, listFilter, overdueOnly, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const hasActiveFilters =
    search || statusFilter !== "ALL" || listFilter !== "ALL" || overdueOnly;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setListFilter("ALL");
    setOverdueOnly(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
            <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TaskStatus | "ALL")}
        >
          <SelectTrigger className="w-[130px]">
            <Filter className="mr-2 h-3 w-3" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="TODO">Todo</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
            </Select>
            {overdueOnly && (
              <Badge variant="secondary">Overdue only</Badge>
            )}
        <Select value={listFilter} onValueChange={setListFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All lists</SelectItem>
            {lists.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("title")}
              >
                <span className="flex items-center gap-1">
                  Title
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground w-24"
                onClick={() => toggleSort("priority")}
              >
                <span className="flex items-center gap-1">
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground w-28"
                onClick={() => toggleSort("status")}
              >
                <span className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("listId")}
              >
                <span className="flex items-center gap-1">
                  List
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground w-32"
                onClick={() => toggleSort("deadline")}
              >
                <span className="flex items-center gap-1">
                  Due
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead className="w-32">Assignees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No tasks match your filters"
                    : "No tasks yet"}
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex gap-0.5">
                          {task.labels.map((l) => (
                            <div
                              key={l.id}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: l.label.color }}
                            />
                          ))}
                        </div>
                      )}
                      <span
                        className={
                          task.status === "DONE"
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                      {task.experiment && <Badge variant="secondary" className="text-[10px]">Growth experiment</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs",
                        PRIORITY_CONFIG[task.priority]?.color,
                      )}
                    >
                      <Flag className="h-3 w-3" />
                      {PRIORITY_CONFIG[task.priority]?.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        STATUS_CONFIG[task.status]?.color,
                      )}
                    >
                      {STATUS_CONFIG[task.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {(task as unknown as Record<string, string>).listName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {task.deadline ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.deadline), "MMM d")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-1">
                      {task.assignees?.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background"
                          title={a.user?.name ?? "User"}
                        >
                          {a.user?.name?.charAt(0) ?? "?"}
                        </div>
                      ))}
                      {(task.assignees?.length ?? 0) > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs ring-2 ring-background">
                          +{task.assignees!.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
