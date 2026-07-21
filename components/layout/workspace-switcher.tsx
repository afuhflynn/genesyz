"use client";

import {
  Building2,
  Check,
  ChevronDown,
  Lightbulb,
  Plus,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartups } from "@/hooks";

interface WorkspaceSwitcherProps {
  currentStartupId?: string;
  variant?: "header" | "sidebar";
}

export function WorkspaceSwitcher({
  currentStartupId,
  variant = "header",
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { data: startupsData, isLoading } = useStartups();

  const startups = startupsData?.data || [];

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />;
  }

  if (variant === "sidebar") {
    return (
      <div className="px-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/dashboard">
            <Lightbulb className="mr-2 h-4 w-4" />
            Ideas Dashboard
          </Link>
        </Button>

        {startups.length > 0 && (
          <>
            <DropdownMenuLabel className="px-2 text-xs text-muted-foreground">
              Your Startups
            </DropdownMenuLabel>
            {startups.map((startup: any) => (
              <Button
                key={startup.id}
                variant={
                  startup.id === currentStartupId ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                asChild
              >
                <Link href={`/startups/${startup.slug}`}>
                  <Rocket className="mr-2 h-4 w-4" />
                  <span className="truncate">{startup.name}</span>
                  {startup.id === currentStartupId && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Link>
              </Button>
            ))}
          </>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          asChild
        >
          <Link href="/startups/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Startup
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Switch Workspace</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <Lightbulb className="mr-2 h-4 w-4" />
            Ideas Dashboard
          </Link>
        </DropdownMenuItem>

        {startups.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Startups
            </DropdownMenuLabel>

            {startups.map((startup: any) => (
              <DropdownMenuItem
                key={startup.id}
                asChild
                disabled={startup.id === currentStartupId}
                className="cursor-pointer"
              >
                <Link href={`/startups/${startup.slug}`}>
                  <Rocket className="mr-2 h-4 w-4" />
                  <span className="truncate">{startup.name}</span>
                  {startup.id === currentStartupId && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/startups/new" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create New Startup
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
