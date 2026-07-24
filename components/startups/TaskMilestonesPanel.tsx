"use client";

import { Archive, Calendar, Flag, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskMilestone, useDeleteTaskMilestone, useUpdateTaskMilestone } from "@/hooks";
import type { TaskMilestone } from "@/lib/api-client";

export function TaskMilestonesPanel({ startupId, milestones }: { startupId: string; milestones: TaskMilestone[] }) {
  const createMilestone = useCreateTaskMilestone();
  const updateMilestone = useUpdateTaskMilestone();
  const deleteMilestone = useDeleteTaskMilestone();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createMilestone.mutateAsync({ startupId, data: { title: title.trim(), description: description.trim() || undefined, targetDate: targetDate ? new Date(`${targetDate}T00:00:00.000Z`).toISOString() : null } });
    setTitle(""); setDescription(""); setTargetDate(""); setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Milestones</h2><p className="text-sm text-muted-foreground">Turn execution into visible roadmap progress.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New milestone</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create milestone</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="milestone-title">Title</Label><Input id="milestone-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Validate first 10 users" />
              <Label htmlFor="milestone-description">Description</Label><Textarea id="milestone-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does success look like?" />
              <Label htmlFor="milestone-date">Target date</Label><Input id="milestone-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              <Button className="w-full" onClick={handleCreate} disabled={!title.trim() || createMilestone.isPending}>{createMilestone.isPending ? "Creating..." : "Create milestone"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {milestones.length === 0 ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No milestones yet. Create one to group tasks around a meaningful outcome.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2">{milestones.map((milestone) => { const progress = milestone.progress ?? { total: 0, completed: 0, percent: 0, overdue: false }; return <Card key={milestone.id}><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{milestone.title}</CardTitle>{milestone.description && <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Archive milestone" onClick={() => updateMilestone.mutate({ startupId, data: { milestoneId: milestone.id, archived: true } })}><Archive className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Delete milestone" onClick={() => deleteMilestone.mutate({ startupId, milestoneId: milestone.id })}><Trash2 className="h-4 w-4" /></Button></div></div></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between text-sm"><span>{progress.completed}/{progress.total} tasks complete</span><span className="font-medium">{progress.percent}%</span></div><Progress value={progress.percent} /><div className="flex items-center gap-3 text-xs text-muted-foreground">{milestone.targetDate && <span className={progress.overdue ? "text-destructive" : ""}><Calendar className="mr-1 inline h-3 w-3" />{format(new Date(milestone.targetDate), "MMM d, yyyy")}</span>} {progress.overdue && <span><Flag className="mr-1 inline h-3 w-3" />Overdue</span>}</div></CardContent></Card>; })}</div>}
    </div>
  );
}
