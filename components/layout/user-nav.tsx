"use client";

import type { User } from "better-auth";
import { Building2, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStartups } from "@/hooks";
import { signOut } from "@/lib/auth-client";

interface UserNavProps {
  user?: User | null;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const { data: startupsData, isLoading: startupsLoading } = useStartups();

  if (!user) return null;

  const startups = startupsData?.data || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Startup Switcher */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Building2 className="h-4 w-4" />
              <span>Your Startups</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {startupsLoading ? (
                <DropdownMenuItem disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </DropdownMenuItem>
              ) : startups.length === 0 ? (
                <DropdownMenuItem asChild>
                  <Link href="/ideas">
                    <Plus className="mr-2 h-4 w-4" />
                    Create from Idea
                  </Link>
                </DropdownMenuItem>
              ) : (
                <>
                  {startups.slice(0, 5).map((startup: any) => (
                    <DropdownMenuItem
                      key={startup.id}
                      onClick={() => router.push(`/startups/${startup.slug}`)}
                    >
                      <span className="truncate">{startup.name}</span>
                    </DropdownMenuItem>
                  ))}
                  {startups.length > 5 && (
                    <DropdownMenuItem asChild>
                      <Link href="/startups">View all ({startups.length})</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/ideas">
                      <Plus className="mr-2 h-4 w-4" />
                      New Startup
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/billing">
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess() {
                  router.push("/sign-in");
                },
              },
            })
          }
          className="hover:text-destructive!"
        >
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
