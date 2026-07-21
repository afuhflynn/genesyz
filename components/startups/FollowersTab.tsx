"use client";

import { Trash2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowers, useRemoveFollower } from "@/hooks";
import { AddFollowerDialog } from "./AddFollowerDialog";

interface FollowersTabProps {
  startupId: string;
  canManage: boolean;
}

export function FollowersTab({ startupId, canManage }: FollowersTabProps) {
  const { data: followers, isLoading, refetch } = useFollowers(startupId);
  const removeFollower = useRemoveFollower();

  const getInitials = (name: string | null, email: string) => {
    if (!name) return email[0].toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRemove = async (followerId: string) => {
    if (confirm("Are you sure you want to remove this follower?")) {
      await removeFollower.mutateAsync({ startupId, followerId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">External Followers</h3>
          <p className="text-sm text-muted-foreground">
            People who receive your weekly updates via email
          </p>
        </div>
        {canManage && (
          <AddFollowerDialog
            startupId={startupId}
            onSuccess={() => refetch()}
          />
        )}
      </div>

      {!followers?.data || followers.data.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <div className="flex justify-center mb-3">
            <UserPlus className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <p className="text-muted-foreground">No external followers yet</p>
          {canManage && (
            <p className="text-sm text-muted-foreground mt-1">
              Add investors, mentors, or advisors to keep them updated
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {followers.data.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(follower.name, follower.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {follower.name || follower.email}
                  </p>
                  {follower.name && (
                    <p className="text-sm text-muted-foreground">
                      {follower.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Added on {formatDate(follower.createdAt)}
                  </p>
                </div>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(follower.id)}
                  disabled={removeFollower.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
