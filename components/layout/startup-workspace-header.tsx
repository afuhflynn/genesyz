"use client";

import { Menu, Rocket } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { UserNav } from "./user-nav";
import { StartupSidebar } from "./startup-sidebar";
import { WorkspaceSwitcher } from "./workspace-switcher";

interface StartupWorkspaceHeaderProps {
  startup: {
    id: string;
    name: string;
    slug: string;
    isLaunched: boolean;
    stage: string;
  };
  permissions?: {
    canViewStartup: boolean;
    canManageTasks: boolean;
    canViewSettings: boolean;
  };
}

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800 border-gray-200",
  VALIDATION: "bg-blue-50 text-blue-800 border-blue-200",
  BUILDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
  LAUNCHED: "bg-green-50 text-green-800 border-green-200",
  SCALING: "bg-purple-50 text-purple-800 border-purple-200",
};

export function StartupWorkspaceHeader({
  startup,
  permissions,
}: StartupWorkspaceHeaderProps) {
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="hidden md:flex">
          <SidebarTrigger className="[&_svg]:size-5" />
        </div>

        <div className="flex md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              {permissions && (
                <StartupSidebar
                  startup={startup}
                  permissions={permissions}
                  className="border-none mt-6"
                />
              )}
            </SheetContent>
          </Sheet>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Rocket className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-lg truncate">
              {startup.name}
            </span>
          </div>
          {startup.isLaunched && (
            <Badge variant="default" className="bg-green-600 text-xs shrink-0">
              Live
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${STAGE_COLORS[startup.stage] || ""} shrink-0 hidden sm:inline-flex`}
          >
            {startup.stage}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WorkspaceSwitcher currentStartupId={startup.id} />
          </div>
          <UserNav user={session?.user} />
        </div>
      </div>
    </header>
  );
}
