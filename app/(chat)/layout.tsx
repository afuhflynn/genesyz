"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className="flex h-screen w-full overflow-hidden"
      defaultOpen={true}
    >
      {children}
    </SidebarProvider>
  );
}
