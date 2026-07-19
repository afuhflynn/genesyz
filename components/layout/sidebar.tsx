"use client";

import {
  Archive,
  Building2,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProfile } from "@/hooks";
import { signOut } from "@/lib/auth-client";
import Image from "next/image";

export function Sidebar() {
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
      active: pathname === "/ideas" || (pathname.startsWith("/ideas") && !pathname.startsWith("/ideas/archived")),
    },
    {
      label: "Startups",
      icon: Building2,
      href: "/startups",
      active: pathname === "/startups",
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
    <>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="Genesyz Logo"
            width={32}
            height={32}
            className="aspect-square object-contain shrink-0"
          />
          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden truncate">
            Genesyz
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes
                .filter((r) => ["Dashboard", "My Ideas", "Startups"].includes(r.label))
                .map((route) => (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      tooltip={route.label}
                      isActive={route.active}
                      asChild
                    >
                      <Link href={route.href}>
                        <route.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {route.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes
                .filter((r) => ["Billing", "Settings", "Archived Ideas", "Admin"].includes(r.label))
                .map((route) => (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      tooltip={route.label}
                      isActive={route.active}
                      asChild
                    >
                      <Link href={route.href}>
                        <route.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {route.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="text-muted-foreground hover:text-destructive w-full justify-start"
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
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
