"use client";

import { Archive, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useDeleteStartup, useStartup } from "@/hooks";

interface StartupSettingsProps {
  slug: string;
}

export function StartupSettings({ slug }: StartupSettingsProps) {
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStartup.mutateAsync(startup.id);
    } catch (error) {
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

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic details about your startup</CardDescription>
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
              <p className="font-medium">{startup.targetMarket || "Not set"}</p>
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
            <p className="font-medium">Week {startup.currentWeekNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Primary Metric</p>
            <p className="font-medium">
              {startup.primaryMetricType.replace(/_/g, " ")}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Weekly reports are sent every Sunday at 9:00 AM UTC. You can manage
            email notifications in your{" "}
            <Link href="/settings" className="text-primary underline">
              account settings
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
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
              <p className="font-medium">Archive this startup</p>
              <p className="text-sm text-muted-foreground">
                This will hide the startup from your dashboard. You can restore
                it later.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive {startup.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will archive the startup and hide it from your
                    dashboard. All your weekly updates and data will be
                    preserved. You can restore it later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Archive Startup
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
