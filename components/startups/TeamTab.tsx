"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { type StartupMemberRole, useTeamMembers } from "@/hooks";
import { AddMemberButton } from "./AddMemberDialog";
import { RoleDropdown } from "./RoleDropdown";

const ROLE_LABELS: Record<StartupMemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<StartupMemberRole, string> = {
  OWNER: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

interface TeamTabProps {
  startupId: string;
  startupSlug: string;
  currentUserId: string;
  canManage: boolean;
}

export function TeamTab({
  startupId,
  startupSlug,
  currentUserId,
  canManage,
}: TeamTabProps) {
  const { data: members, isLoading, refetch } = useTeamMembers(startupId);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
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
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this startup
          </p>
        </div>
        {canManage && (
          <AddMemberButton
            startupId={startupId}
            startupSlug={startupSlug}
            onSuccess={() => refetch()}
          />
        )}
      </div>

      {members?.data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No team members yet</p>
          {canManage && (
            <p className="text-sm">
              Click &quot;Add Member&quot; to invite collaborators
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members?.data.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user.image ?? undefined} />
                  <AvatarFallback>
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {member.user.name || "Unnamed User"}
                      {member.userId === currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        ROLE_COLORS[member.role]
                      }`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(new Date(member.createdAt))}
                  </p>
                </div>
              </div>
              {canManage && !member.isOwner && (
                <RoleDropdown
                  member={member}
                  startupId={startupId}
                  currentUserId={currentUserId}
                  onUpdate={() => refetch()}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
