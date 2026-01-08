"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Lightbulb,
  PlusCircle,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useProfile } from "@/hooks";
import Image from "next/image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: user } = useProfile();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "My Ideas",
      icon: Lightbulb,
      href: "/ideas",
      active: pathname === "/ideas" || pathname.startsWith("/ideas/"),
    },
    {
      label: "New Idea",
      icon: PlusCircle,
      href: "/ideas/new",
      active: pathname === "/ideas/new",
    },
    {
      label: "Billing",
      icon: CreditCard,
      href: "/billing",
      active: pathname === "/billing",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ];

  if (user?.role === "ADMIN") {
    routes.push({
      label: "Admin",
      icon: Shield,
      href: "/admin",
      active: pathname.startsWith("/admin"),
    });
  }

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-4">
            <Link href="/dashboard">
              <Image
                src="/images/logo/logo-header.png"
                alt="IdeasVault"
                width={140}
                height={56}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 w-full px-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <Sidebar className="border-none" />
      </SheetContent>
    </Sheet>
  );
}
