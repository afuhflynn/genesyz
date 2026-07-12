"use client";

import { StartupWorkspaceHeader } from "@/components/layout/startup-workspace-header";
import { StartupSidebar } from "@/components/layout/startup-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

interface StartupLayoutShellProps {
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
  children: React.ReactNode;
}

export function StartupLayoutShell({
  startup,
  permissions,
  children,
}: StartupLayoutShellProps) {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex h-screen flex-col overflow-hidden"
    >
      <StartupWorkspaceHeader startup={startup} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsible="icon">
          <StartupSidebar startup={startup} permissions={permissions} />
        </Sidebar>
        <SidebarInset className="overflow-hidden flex flex-col">
          <main className="flex-1 overflow-auto pt-6 px-6 items-center flex">
            <div className="h-full w-full">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
