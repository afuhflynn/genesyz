"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { format } from "date-fns";
import {
  Calendar,
  ExternalLink,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type Application,
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  useUpdateApplication,
} from "@/hooks";

const COLUMNS = [
  { id: "TO_APPLY", title: "To Apply", color: "bg-gray-100" },
  { id: "APPLIED", title: "Applied", color: "bg-blue-100" },
  { id: "INTERVIEWING", title: "Interviewing", color: "bg-yellow-100" },
  { id: "ACCEPTED", title: "Accepted", color: "bg-green-100" },
  { id: "REJECTED", title: "Rejected", color: "bg-red-100" },
];

const APPLICATION_TYPES = [
  { value: "GRANT", label: "Grant" },
  { value: "PRE_SEED", label: "Pre-Seed" },
  { value: "SEED", label: "Seed" },
  { value: "ACCELERATOR", label: "Accelerator" },
  { value: "FELLOWSHIP", label: "Fellowship" },
  { value: "OTHER", label: "Other" },
];

interface ApplicationKanbanProps {
  startupId: string;
  startupSlug: string;
}

function ApplicationCard({
  application,
  onDelete,
}: {
  application: Application;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {application.title}
            </h4>
            {application.organization && (
              <p className="text-xs text-muted-foreground truncate">
                {application.organization}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(application.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {application.deadline && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Due: {format(new Date(application.deadline), "MMM d, yyyy")}
            </span>
          </div>
        )}

        {application.url && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function Column({
  id,
  title,
  applications,
  onDelete,
}: {
  id: string;
  title: string;
  applications: Application[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[250px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-muted/50" : "bg-muted/20"
        }`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} onDelete={onDelete} />
        ))}
        {applications.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No applications
          </div>
        )}
      </div>
    </div>
  );
}

export function ApplicationKanban({
  startupId,
  startupSlug,
}: ApplicationKanbanProps) {
  const { data: applicationsData, isLoading } = useApplications(startupId);
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    title: "",
    description: "",
    url: "",
    organization: "",
    type: "GRANT",
    deadline: "",
  });

  const applications = applicationsData?.data || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as string;

    if (COLUMNS.some((col) => col.id === newStatus)) {
      const app = applications.find((a) => a.id === applicationId);
      if (app && app.status !== newStatus) {
        await updateMutation.mutateAsync({
          startupId,
          data: {
            applicationId,
            status: newStatus,
          },
        });
      }
    }
  };

  const handleAddApplication = async () => {
    if (!newApp.title.trim()) return;

    await createMutation.mutateAsync({
      startupId,
      data: newApp,
    });

    setNewApp({
      title: "",
      description: "",
      url: "",
      organization: "",
      type: "GRANT",
      deadline: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ startupId, applicationId: id });
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Application Tracker</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newApp.title}
                  onChange={(e) =>
                    setNewApp({ ...newApp, title: e.target.value })
                  }
                  placeholder="e.g., Y Combinator W26"
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={newApp.organization}
                  onChange={(e) =>
                    setNewApp({ ...newApp, organization: e.target.value })
                  }
                  placeholder="e.g., Y Combinator"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newApp.type}
                  onValueChange={(value) =>
                    setNewApp({ ...newApp, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newApp.url}
                  onChange={(e) =>
                    setNewApp({ ...newApp, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newApp.deadline}
                  onChange={(e) =>
                    setNewApp({ ...newApp, deadline: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Notes</Label>
                <Textarea
                  id="description"
                  value={newApp.description}
                  onChange={(e) =>
                    setNewApp({ ...newApp, description: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </div>
              <Button onClick={handleAddApplication} className="w-full">
                Add Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              applications={getApplicationsByStatus(column.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
