"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center m-0! content-between w-full relative justify-between px-3! md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hidden md:flex [&_svg]:size-5" />
          <div className="flex md:hidden">
            <MobileSidebar />
          </div>
        </div>
        <UserNav user={session?.user} />
      </div>
    </header>
  );
}
