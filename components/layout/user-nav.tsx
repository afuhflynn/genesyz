"use client";

import type { User } from "better-auth";
import { Building2, Loader2, Plus, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const hasStartups = startups.length > 0;

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
              <span>Startups</span>
              {!hasStartups && (
                <Badge
                  variant="default"
                  className="ml-auto bg-primary px-1.5 py-0 text-[10px] font-semibold"
                >
                  NEW
                </Badge>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              {startupsLoading ? (
                <div className="p-2">
                  <DropdownMenuItem disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </DropdownMenuItem>
                </div>
              ) : hasStartups ? (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Your Startups
                  </DropdownMenuLabel>
                  {startups.slice(0, 5).map((startup: any) => (
                    <DropdownMenuItem
                      key={startup.id}
                      onClick={() => router.push(`/startups/${startup.slug}`)}
                    >
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{startup.name}</span>
                      {startup.isLaunched && (
                        <Badge
                          variant="outline"
                          className="ml-auto border-green-600 text-green-600 text-[10px]"
                        >
                          Live
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  {startups.length > 5 && (
                    <DropdownMenuItem asChild>
                      <Link href="/startups" className="text-muted-foreground">
                        View all ({startups.length})
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/startups/new">
                      <Plus className="mr-2 h-4 w-4" />
                      New Startup
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1.5">
                        <Rocket className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Startup Profiles</p>
                        <Badge
                          variant="default"
                          className="bg-primary px-1.5 py-0 text-[10px]"
                        >
                          NEW
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Turn your validated ideas into active startups. Track
                      weekly progress with KPIs and get AI coaching to stay on
                      track.
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="bg-primary/5">
                    <Link href="/startups/new" className="font-medium">
                      <Sparkles className="mr-2 h-4 w-4 text-primary" />
                      Create Your First Startup
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
