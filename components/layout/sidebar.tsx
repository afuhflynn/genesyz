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
  Archive,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useProfile } from "@/hooks";
import Image from "next/image";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: user } = useProfile();
  const router = useRouter();

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
      active: pathname === "/ideas",
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
    {
      label: "Archived Ideas",
      icon: Archive,
      href: "/ideas/archived",
      active: pathname === "/ideas/archived",
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
    <ScrollArea
      className={cn(
        "h-full! overflow-auto flex-col justify-between border-r bg-background relative",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
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
      <div className="w-full px-3 absolute bottom-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess() {
                  router.push("/sign-in");
                },
              },
            })
          }
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </ScrollArea>
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
