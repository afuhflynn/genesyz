"use client";

import {
  ArrowLeft,
  Brain,
  Briefcase,
  Calendar,
  FileText,
  Flame,
  LayoutDashboard,
  MessageSquareIcon,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface StartupSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  startup: {
    id: string;
    name: string;
    slug: string;
    isLaunched: boolean;
    stage: string;
  };
  permissions: {
    canViewStartup: boolean;
    canManageTasks: boolean;
    canViewSettings: boolean;
  };
}

export function StartupSidebar({
  startup,
  permissions,
  className,
}: StartupSidebarProps) {
  const pathname = usePathname();
  const basePath = `/startups/${startup.slug}`;

  const routes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: basePath,
      active: pathname === basePath,
      visible: permissions.canViewStartup,
    },
    {
      label: "VC Coach",
      icon: MessageSquareIcon,
      href: `${basePath}/chat`,
      active: pathname === `${basePath}/chat` || pathname.startsWith(`${basePath}/chat/`),
      visible: permissions.canViewStartup,
    },
    {
      label: "Research Feed",
      icon: Brain,
      href: `/startups/${startup.slug}/research-feed`,
      active: pathname === `/startups/${startup.slug}/research-feed`,
      visible: permissions.canViewStartup,
    },
    {
      label: "Weekly Updates",
      icon: Calendar,
      href: `${basePath}/updates`,
      active: pathname.startsWith(`${basePath}/updates`),
      visible: permissions.canViewStartup,
    },
    {
      label: "Streaks",
      icon: Flame,
      href: `${basePath}/streaks`,
      active: pathname === `${basePath}/streaks`,
      visible: permissions.canViewStartup,
    },
    {
      label: "Tasks",
      icon: FileText,
      href: `${basePath}/tasks`,
      active:
        pathname.startsWith(`${basePath}/tasks`) ||
        pathname.startsWith(`${basePath}/applications`),
      visible: permissions.canManageTasks,
    },
    {
      label: "Opportunities",
      icon: Briefcase,
      href: `${basePath}/opportunities`,
      active: pathname === `${basePath}/opportunities`,
      visible: permissions.canViewStartup,
    },
    {
      label: "Metrics",
      icon: TrendingUp,
      href: `${basePath}/metrics`,
      active: pathname === `${basePath}/metrics` || pathname.startsWith(`${basePath}/metrics/`),
      visible: permissions.canViewStartup,
    },
    {
      label: "Profile",
      icon: User,
      href: `${basePath}/profile`,
      active: pathname === `${basePath}/profile`,
      visible: permissions.canViewStartup,
    },
    {
      label: "Settings",
      icon: Settings,
      href: `${basePath}/settings`,
      active: pathname === `${basePath}/settings`,
      visible: permissions.canViewSettings,
    },
  ].filter((route) => route.visible);

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Back to Dashboard" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">
                  Back to Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={cn("p-1", className)}>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Track
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes
                .filter((r) => !["Profile", "Settings"].includes(r.label))
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
            Setup
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes
                .filter((r) => ["Profile", "Settings"].includes(r.label))
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
    </>
  );
}
