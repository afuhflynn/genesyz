"use client";

import { ArrowLeft, Loader2, Settings2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TeamTab } from "@/components/startups/TeamTab";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteStartup, useStartup } from "@/hooks";
import { getWeeksSinceCreation } from "@/lib/utils/date";

interface StartupSettingsProps {
  slug: string;
  currentUserId: string;
}

export function StartupSettings({ slug, currentUserId }: StartupSettingsProps) {
  const router = useRouter();
  const { data: startup, isLoading } = useStartup(slug);
  const deleteStartup = useDeleteStartup();
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!startup) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">Startup not found</p>
        </CardContent>
      </Card>
    );
  }

  const isOwner = startup.userId === currentUserId;
  const canManage = true;

  const weekNumber = getWeeksSinceCreation(startup.createdAt);
  const submissionCount = startup._count?.weeklyUpdates ?? 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStartup.mutateAsync(startup.id);
      router.push("/startups");
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Basic details about your startup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{startup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <p className="font-medium">{startup.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{startup.industry || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Market</p>
                  <p className="font-medium">
                    {startup.targetMarket || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{startup.website || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{startup.location || "Not set"}</p>
                </div>
              </div>

              <Button asChild variant="outline">
                <Link href={`/startups/${slug}/profile`}>Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Report Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Reports</CardTitle>
              <CardDescription>
                Manage how you receive weekly progress reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Week</p>
                <p className="font-medium">
                  Week {weekNumber} ({submissionCount} update
                  {submissionCount !== 1 ? "s" : ""})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Metric</p>
                <p className="font-medium">
                  {startup.primaryMetricType.replace(/_/g, " ")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly reports are sent every Sunday at 9:00 AM UTC. You can
                manage email notifications in your{" "}
                <Link href="/settings" className="text-primary underline">
                  account settings
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone - Only for owner */}
          {isOwner && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this startup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                  <div>
                    <p className="font-medium">
                      Permanently delete this startup
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This cannot be undone. All weekly updates, metrics, and
                      goals will be deleted. The original idea can be deleted
                      afterward.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        {isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Permanently delete {startup.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          This action cannot be undone. This will permanently
                          delete:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {submissionCount > 0 && (
                              <li>All {submissionCount} weekly updates</li>
                            )}
                            <li>All metrics history</li>
                            <li>All goals and progress data</li>
                          </ul>
                          <br />
                          The original idea will remain and can be deleted
                          afterward.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Permanently Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team">
          <TeamTab
            startupId={startup.id}
            startupSlug={slug}
            currentUserId={currentUserId}
            canManage={canManage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
