"use client";

import { Header } from "@/components/layout/header";
import { Sidebar as AppSidebar } from "@/components/layout/sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex h-screen flex-col overflow-hidden"
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <SidebarInset className="overflow-hidden flex flex-col">
          <Header />
          <main className="flex w-full h-full overflow-auto flex-col pt-8 px-6 items-center">
            <div className="h-full w-full">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
