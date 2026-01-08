"use client";

import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { useProfile } from "@/hooks";

export function Header() {
  const { data: user } = useProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MobileSidebar />
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/dashboard">
            <span className="hidden font-bold sm:inline-block">IdeasVault</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other header items here */}
          </div>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
