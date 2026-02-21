"use client";

import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  LayoutDashboard,
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
}

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800",
  VALIDATION: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHED: "bg-green-100 text-green-800",
  SCALING: "bg-purple-100 text-purple-800",
};

export function StartupSidebar({ startup, className }: StartupSidebarProps) {
  const pathname = usePathname();
  const basePath = `/startups/${startup.slug}`;

  const routes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: basePath,
      active: pathname === basePath,
    },
    {
      label: "Weekly Updates",
      icon: Calendar,
      href: `${basePath}/updates`,
      active: pathname.startsWith(`${basePath}/updates`),
    },
    {
      label: "Metrics",
      icon: TrendingUp,
      href: `${basePath}/metrics`,
      active: pathname === `${basePath}/metrics`,
    },
    {
      label: "Startup School",
      icon: GraduationCap,
      href: `${basePath}/school`,
      active: pathname === `${basePath}/school`,
    },
    {
      label: "Co-Founder Match",
      icon: Users,
      href: `${basePath}/cofounders`,
      active: pathname === `${basePath}/cofounders`,
    },
    {
      label: "Profile",
      icon: User,
      href: `${basePath}/profile`,
      active: pathname === `${basePath}/profile`,
    },
    {
      label: "Settings",
      icon: Settings,
      href: `${basePath}/settings`,
      active: pathname === `${basePath}/settings`,
    },
  ];

  return (
    <ScrollArea
      className={cn(
        "h-full! overflow-auto flex-col border-r bg-background",
        className,
      )}
    >
      <div className="space-y-4 py-4">
        {/* Back to Ideas */}
        <div className="px-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Startup Info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-lg truncate">
              {startup.name}
            </span>
            {startup.isLaunched && (
              <Badge variant="default" className="bg-green-600 text-xs">
                Live
              </Badge>
            )}
          </div>
          <Badge
            variant="secondary"
            className={cn("text-xs", STAGE_COLORS[startup.stage] || "")}
          >
            {startup.stage}
          </Badge>
        </div>

        <Separator />

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
