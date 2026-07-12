"use client";

import { Loader2, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { type SearchedUser, useAddTeamMember, useSearchUsers } from "@/hooks";

type AddableRole = "ADMIN" | "MEMBER" | "VIEWER";

interface AddMemberDialogProps {
  startupId: string;
  startupSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMemberDialog({
  startupId,
  startupSlug,
  open,
  onOpenChange,
  onSuccess,
}: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<AddableRole>("MEMBER");

  const { data: users, isLoading } = useSearchUsers(searchQuery, startupSlug);
  const addMember = useAddTeamMember();

  const handleAddUser = async (user: SearchedUser) => {
    try {
      await addMember.mutateAsync({
        startupId,
        userId: user.id,
        role: selectedRole,
      });
      onOpenChange(false);
      setSearchQuery("");
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b p-3">
          <UserPlus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Team Member</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AddableRole)}
            className="ml-auto rounded-md border px-2 py-1 text-xs"
          >
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <CommandInput
          placeholder="Search by name or email..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {searchQuery.length < 2
              ? "Type at least 2 characters to search"
              : "No users found"}
          </CommandEmpty>
          <CommandGroup heading="Users">
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {users?.data.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleAddUser(user)}
                value={`${user.name} ${user.email}`}
                className="cursor-pointer"
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{user.name || "Unnamed User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <Plus className="ml-auto h-4 w-4" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}

interface AddMemberButtonProps {
  startupId: string;
  startupSlug: string;
  onSuccess?: () => void;
}

export function AddMemberButton({
  startupId,
  startupSlug,
  onSuccess,
}: AddMemberButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Add Member
      </Button>
      <AddMemberDialog
        startupId={startupId}
        startupSlug={startupSlug}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
