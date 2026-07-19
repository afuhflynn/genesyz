"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ideas": "My Ideas",
  "/ideas/new": "New Idea",
  "/ideas/archived": "Archived Ideas",
  "/startups": "Startups",
  "/startups/new": "New Startup",
  "/billing": "Billing",
  "/settings": "Settings",
  "/admin": "Admin",
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const pageTitle = Object.entries(routeTitles).find(([path]) =>
    pathname.startsWith(path),
  )?.[1];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center m-0! content-between w-full relative justify-between px-3! md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="[&_svg]:size-5" />
          {pageTitle && (
            <span className="text-sm font-semibold text-foreground md:hidden truncate max-w-[150px]">
              {pageTitle}
            </span>
          )}
        </div>
        <UserNav user={session?.user} />
      </div>
    </header>
  );
}
