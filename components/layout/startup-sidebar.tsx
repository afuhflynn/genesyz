"use client";

import {
  ArrowLeft,
  Brain,
  Briefcase,
  Calendar,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  MessageSquareIcon,
  Settings,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800",
  VALIDATION: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHED: "bg-green-100 text-green-800",
  SCALING: "bg-purple-100 text-purple-800",
};

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
      active: pathname === `${basePath}/chat`,
      visible: permissions.canViewStartup,
    },
    {
      label: "Research Feed",
      icon: Brain,
      href: `/startups/${startup.slug}/research-feed`,
      active: pathname === `/startups/${startup.slug}/research-feed`,
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
      active: pathname === `${basePath}/metrics`,
      visible: permissions.canViewStartup,
    },
    // {
    //   label: "Startup School",
    //   icon: GraduationCap,
    //   href: `${basePath}/school`,
    //   active: pathname === `${basePath}/school`,
    //   visible: permissions.canViewStartup,
    // },
    // {
    //   label: "Co-Founder Match",
    //   icon: Users,
    //   href: `${basePath}/cofounders`,
    //   active: pathname === `${basePath}/cofounders`,
    //   visible: permissions.canViewStartup,
    // },
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
    <ScrollArea
      className={cn(
        "h-full! overflow-auto flex-col border-r bg-background",
        className,
      )}
    >
      <div className="space-y-4 py-4">
        {/* Navigation */}
        <div className="px-3">
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
    </ScrollArea>
  );
}
