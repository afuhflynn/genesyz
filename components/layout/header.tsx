"use client";

import Link from "next/link";
import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { useProfile } from "@/hooks";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className=" flex h-14 items-center px-0! m-0! content-between w-full! relative">
        <MobileSidebar />
        <div className="hidden md:flex w-full items-center justify-between">
          <Link href="/" className="flex items-center h-7.5 w-30">
            <Image
              src="/images/logo/source-icon.png"
              alt="IdeasVault Logo"
              width={120}
              height={30}
              className="h-14 w-auto"
            />

            <span className="text-xl font-semibold">IdeasVault</span>
          </Link>
          <div className="mr-5">
            <UserNav user={session?.user} />
          </div>
        </div>
      </div>
    </header>
  );
}
