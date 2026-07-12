"use client";

import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex h-screen flex-col overflow-hidden"
    >
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </SidebarProvider>
  );
}

export function SidebarPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ShadcnSidebar collapsible="icon" className={className}>
      {children}
    </ShadcnSidebar>
  );
}

export { SidebarInset };
