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
