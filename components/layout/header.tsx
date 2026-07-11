"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-0! m-0! content-between w-full relative">
        <div className="flex md:hidden">
          <MobileSidebar />
        </div>
        <div className="flex md:w-full items-center justify-between md:px-5">
          <Link href="/" className="items-center h-7.5 w-30 hidden md:flex">
            <Image
              src="/icon.png"
              alt="Genesyz Logo"
              width={46}
              height={46}
              className="aspect-square object-contain"
            />

            <span className="text-xl font-semibold">Genesyz</span>
          </Link>
          <div className="absolute md:relative right-5 self-center md:right-0 flex items-center gap-3">
            {/* <WorkspaceSwitcher /> */}
            <UserNav user={session?.user} />
          </div>
        </div>
      </div>
    </header>
  );
}
