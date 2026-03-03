"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Calendar,
  ExternalLink,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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

function SortableApplicationCard({
  application,
  onDelete,
}: {
  application: Application;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <ApplicationCardContent
        application={application}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function ApplicationCardContent({
  application,
  onDelete,
  dragHandleProps,
}: {
  application: Application;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  return (
    <Card className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button
              className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 hover:bg-muted rounded"
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
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
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
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

function DraggableApplicationCard({
  application,
  onDelete,
}: {
  application: Application;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: application.id,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="touch-none">
      <ApplicationCardContent application={application} onDelete={onDelete} />
    </div>
  );
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
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
            isOver ? "bg-muted/50" : "bg-muted/20"
          }`}
        >
          {applications.map((app) => (
            <SortableApplicationCard
              key={app.id}
              application={app}
              onDelete={onDelete}
            />
          ))}
          {applications.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No applications
            </div>
          )}
        </div>
      </SortableContext>
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

  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (applicationsData?.data) {
      setLocalApplications(applicationsData.data);
    }
  }, [applicationsData]);

  const applications: Application[] = localApplications;

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const newStatus = over.id as string;

    if (COLUMNS.some((col) => col.id === newStatus)) {
      const app = applications.find((a) => a.id === applicationId);
      if (app && app.status !== newStatus) {
        const oldStatus = app.status;

        setLocalApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId ? { ...a, status: newStatus } : a,
          ),
        );

        try {
          await updateMutation.mutateAsync({
            startupId,
            data: {
              applicationId,
              status: newStatus,
            },
          });
        } catch (error) {
          setLocalApplications((prev) =>
            prev.map((a) =>
              a.id === applicationId ? { ...a, status: oldStatus } : a,
            ),
          );
        }
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
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
    const appToDelete = applications.find((a) => a.id === id);
    setLocalApplications((prev) => prev.filter((a) => a.id !== id));

    try {
      await deleteMutation.mutateAsync({ startupId, applicationId: id });
    } catch (error) {
      if (appToDelete) {
        setLocalApplications((prev) => [...prev, appToDelete]);
      }
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const activeApplication = activeId
    ? applications.find((a) => a.id === activeId)
    : null;

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
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
        <DragOverlay>
          {activeApplication ? (
            <DraggableApplicationCard
              application={activeApplication}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
