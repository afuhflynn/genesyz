"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  Grid3X3,
  ListVideo,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAdminCourse,
  useUpdateCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks";
import { LessonContentEditor } from "@/components/admin/lms/lesson-content-editor";

const lessonTypeIcons: Record<string, any> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: Grid3X3,
  ASSIGNMENT: ListVideo,
};

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function AdminCourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useAdminCourse(id);
  const updateCourse = useUpdateCourse();
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const course = data?.data as any;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState("");

  const [saving, setSaving] = useState(false);

  const [contentEditorLesson, setContentEditorLesson] = useState<any | null>(null);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description ?? "");
      setThumbnail(course.thumbnail ?? "");
      setIsPublished(course.isPublished);
    }
  }, [course]);

  if (isLoading) return <EditorSkeleton />;
  if (error || !course) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const modules = course.modules ?? [];

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    updateCourse.mutate(
      {
        id,
        data: { title, description, thumbnail, isPublished },
      },
      { onSettled: () => setSaving(false) },
    );
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    createModule.mutate(
      { courseId: id, data: { title: newModuleTitle.trim() } },
      {
        onSuccess: () => {
          setModuleDialogOpen(false);
          setNewModuleTitle("");
        },
      },
    );
  };

  const handleStartEditModule = (module: any) => {
    setEditingModuleId(module.id);
    setEditModuleTitle(module.title);
  };

  const handleSaveEditModule = () => {
    if (!editingModuleId || !editModuleTitle.trim()) return;
    updateModule.mutate({
      id: editingModuleId,
      data: { title: editModuleTitle.trim() },
    });
    setEditingModuleId(null);
  };

  const handleMoveModule = (index: number, direction: "up" | "down") => {
    const newModules = [...modules];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newModules.length) return;
    const temp = newModules[index].position;
    newModules[index].position = newModules[swapIndex].position;
    newModules[swapIndex].position = temp;

    updateModule.mutate({
      id: newModules[index].id,
      data: { title: newModules[index].title },
    });
    updateModule.mutate({
      id: newModules[swapIndex].id,
      data: { title: newModules[swapIndex].title },
    });
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonModuleId) return;
    const data: any = { type: newLessonType };
    if (newLessonTitle.trim()) data.title = newLessonTitle.trim();
    if (newLessonType === "VIDEO" && newLessonVideoUrl.trim())
      data.videoUrl = newLessonVideoUrl.trim();
    createLesson.mutate(
      { moduleId: lessonModuleId, data },
      {
        onSuccess: () => {
          setLessonDialogOpen(false);
          setNewLessonTitle("");
          setNewLessonVideoUrl("");
          setNewLessonType("VIDEO");
          setLessonModuleId("");
        },
      },
    );
  };

  const handleStartEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title ?? "");
    setEditLessonVideoUrl(lesson.videoUrl ?? "");
  };

  const handleSaveEditLesson = () => {
    if (!editingLessonId) return;
    const data: any = {};
    if (editLessonTitle.trim()) data.title = editLessonTitle.trim();
    if (editLessonVideoUrl.trim()) data.videoUrl = editLessonVideoUrl.trim();
    updateLesson.mutate({ id: editingLessonId, data });
    setEditingLessonId(null);
  };

  const handleContentSave = (data: Record<string, unknown>) => {
    if (!contentEditorLesson) return;
    setContentSaving(true);
    updateLesson.mutate(
      { id: contentEditorLesson.id, data },
      {
        onSettled: () => {
          setContentSaving(false);
          setContentEditorOpen(false);
          setContentEditorLesson(null);
        },
      },
    );
  };

  const lessonTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      VIDEO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      TEXT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      QUIZ: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      ASSIGNMENT:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[type] ?? "";
  };

  const sortedModules = [...modules].sort(
    (a: any, b: any) => a.position - b.position,
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p className="text-muted-foreground mt-2">
          Manage course details, modules, and lessons.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
            <Input
              id="edit-thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-desc">Description</Label>
          <Textarea
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label className="cursor-pointer">Published</Label>
          </div>
          <Button onClick={handleSaveCourse} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Curriculum</h2>
          <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Module</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    placeholder="Introduction"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModuleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createModule.isPending}>
                    {createModule.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sortedModules.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              No modules yet. Click "Add Module" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedModules.map((module: any, moduleIndex: number) => {
              const sortedLessons = [...(module.lessons ?? [])].sort(
                (a: any, b: any) => a.position - b.position,
              );
              const isExpanded = expandedModules.has(module.id);

              return (
                <div key={module.id} className="rounded-lg border">
                  <div className="flex items-center gap-2 px-4 py-3 hover:bg-muted/50">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {editingModuleId === module.id ? (
                        <Input
                          value={editModuleTitle}
                          onChange={(e) => setEditModuleTitle(e.target.value)}
                          onBlur={handleSaveEditModule}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditModule();
                            if (e.key === "Escape") setEditingModuleId(null);
                          }}
                          className="h-7 text-sm"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-medium">{module.title}</span>
                      )}
                      <Badge variant="outline" className="ml-2">
                        {sortedLessons.length} lesson
                        {sortedLessons.length !== 1 ? "s" : ""}
                      </Badge>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleStartEditModule(module)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={moduleIndex === 0}
                        onClick={() => handleMoveModule(moduleIndex, "up")}
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={moduleIndex === sortedModules.length - 1}
                        onClick={() => handleMoveModule(moduleIndex, "down")}
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Module</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{module.title}" and all its lessons?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteModule.mutate(module.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t px-4 py-3 space-y-2">
                      {sortedLessons.map((lesson: any) => {
                        const Icon = lessonTypeIcons[lesson.type] ?? BookOpen;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 rounded-md border px-3 py-2"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              {editingLessonId === lesson.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editLessonTitle}
                                    onChange={(e) =>
                                      setEditLessonTitle(e.target.value)
                                    }
                                    placeholder="Lesson title"
                                    className="h-7 text-sm"
                                    autoFocus
                                  />
                                  {lesson.type === "VIDEO" && (
                                    <Input
                                      value={editLessonVideoUrl}
                                      onChange={(e) =>
                                        setEditLessonVideoUrl(e.target.value)
                                      }
                                      placeholder="YouTube video URL"
                                      className="h-7 text-sm"
                                    />
                                  )}
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 text-xs"
                                      onClick={handleSaveEditLesson}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs"
                                      onClick={() =>
                                        setEditingLessonId(null)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm truncate block">
                                  {lesson.title || "Untitled"}
                                </span>
                              )}
                            </div>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${lessonTypeBadge(lesson.type)}`}
                            >
                              {lesson.type}
                            </Badge>
              {editingLessonId !== lesson.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      setContentEditorLesson(lesson);
                      setContentEditorOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Content
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      handleStartEditLesson(lesson)
                    }
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Lesson
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete this lesson?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteLesson.mutate(lesson.id)
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
                          </div>
                        );
                      })}

                      <Dialog
                        open={lessonDialogOpen && lessonModuleId === module.id}
                        onOpenChange={(open) => {
                          setLessonDialogOpen(open);
                          if (!open) setLessonModuleId("");
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setLessonModuleId(module.id);
                              setLessonDialogOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Add Lesson
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Lesson</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateLesson}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="lesson-title">
                                Title (optional)
                              </Label>
                              <Input
                                id="lesson-title"
                                placeholder="Getting Started"
                                value={newLessonTitle}
                                onChange={(e) =>
                                  setNewLessonTitle(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lesson-type">Type</Label>
                              <Select
                                value={newLessonType}
                                onValueChange={setNewLessonType}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="VIDEO">Video</SelectItem>
                                  <SelectItem value="TEXT">Text</SelectItem>
                                  <SelectItem value="QUIZ">Quiz</SelectItem>
                                  <SelectItem value="ASSIGNMENT">
                                    Assignment
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {newLessonType === "VIDEO" && (
                              <div className="space-y-2">
                                <Label htmlFor="lesson-video">
                                  YouTube URL
                                </Label>
                                <Input
                                  id="lesson-video"
                                  placeholder="https://youtube.com/watch?v=..."
                                  value={newLessonVideoUrl}
                                  onChange={(e) =>
                                    setNewLessonVideoUrl(e.target.value)
                                  }
                                />
                              </div>
                            )}
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setLessonDialogOpen(false);
                                  setLessonModuleId("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createLesson.isPending}
                              >
                                {createLesson.isPending ? "Adding..." : "Add"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LessonContentEditor
        lesson={contentEditorLesson ?? {}}
        open={contentEditorOpen}
        onOpenChange={(open) => {
          setContentEditorOpen(open);
          if (!open) setContentEditorLesson(null);
        }}
        onSave={handleContentSave}
        isSaving={contentSaving}
      />
    </div>
  );
}
