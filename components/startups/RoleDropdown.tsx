"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type StartupMember,
  useRemoveTeamMember,
  useUpdateTeamMember,
} from "@/hooks";

interface RoleDropdownProps {
  member: StartupMember;
  startupId: string;
  currentUserId: string;
  onUpdate?: () => void;
}

const ROLE_OPTIONS = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Can manage team, edit profile, submit updates",
  },
  {
    value: "MEMBER",
    label: "Member",
    description: "Can submit weekly updates, view dashboard",
  },
  {
    value: "VIEWER",
    label: "Viewer",
    description: "View-only access to the startup",
  },
] as const;

export function RoleDropdown({
  member,
  startupId,
  currentUserId,
  onUpdate,
}: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const updateRole = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();

  const _isCurrentUser = member.userId === currentUserId;
  const canManage = !member.isOwner;

  const handleRoleChange = async (newRole: "ADMIN" | "MEMBER" | "VIEWER") => {
    try {
      await updateRole.mutateAsync({
        startupId,
        memberId: member.id,
        role: newRole,
      });
      onUpdate?.();
    } catch {
      // Error handled by hook
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync({
        startupId,
        memberId: member.id,
      });
      onUpdate?.();
    } catch {
      // Error handled by hook
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Change Role</p>
          <p className="text-xs text-muted-foreground">
            Select a new role for this member
          </p>
        </div>
        <DropdownMenuSeparator />
        {ROLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleRoleChange(option.value)}
            disabled={member.role === option.value}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleRemove}
          className="text-destructive focus:text-destructive"
        >
          Remove from team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
