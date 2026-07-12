"use client";

import { Check, Lightbulb, Menu, Plus, Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStartups } from "@/hooks";
import { StartupSidebar } from "./startup-sidebar";

interface MobileStartupNavProps {
  startup: {
    id: string;
    name: string;
    slug: string;
    isLaunched: boolean;
    stage: string;
  };
  permissions: {
    canViewStartup: boolean;
    canManageTasks: boolean;
    canViewSettings: boolean;
  };
}

export function MobileStartupNav({
  startup,
  permissions,
}: MobileStartupNavProps) {
  const [open, setOpen] = useState(false);
  const { data: startupsData } = useStartups();
  const startups = startupsData?.data || [];

  return (
    <div className="flex md:hidden items-center gap-2 px-4 py-2 border-b bg-background">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <StartupSidebar
            startup={startup}
            permissions={permissions}
            className="border-none mt-6"
          />
        </SheetContent>
      </Sheet>

      {/* Startup Name */}
      <div className="flex items-center gap-2 flex-1">
        <Rocket className="h-4 w-4 text-primary" />
        <span className="font-medium truncate">{startup.name}</span>
        {startup.isLaunched && (
          <Badge variant="default" className="bg-green-600 text-xs">
            Live
          </Badge>
        )}
      </div>

      {/* Workspace Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Switch
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard">
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

              {startups.map((s: any) => (
                <DropdownMenuItem
                  key={s.id}
                  asChild
                  disabled={s.id === startup.id}
                >
                  <Link href={`/startups/${s.slug}`}>
                    <Rocket className="mr-2 h-4 w-4" />
                    <span className="truncate">{s.name}</span>
                    {s.id === startup.id && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/startups/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Startup
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
