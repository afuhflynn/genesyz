"use client";

import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { UserNav } from "./user-nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

interface StartupWorkspaceHeaderProps {
  startup: {
    id: string;
    name: string;
    slug: string;
    isLaunched: boolean;
    stage: string;
  };
}

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800 border-gray-200",
  VALIDATION: "bg-blue-50 text-blue-800 border-blue-200",
  BUILDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
  LAUNCHED: "bg-green-50 text-green-800 border-green-200",
  SCALING: "bg-purple-50 text-purple-800 border-purple-200",
};

export function StartupWorkspaceHeader({
  startup,
}: StartupWorkspaceHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left: Back to Ideas */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Ideas</span>
        </Link>

        <Separator orientation="vertical" className="h-6" />

        {/* Center: Startup Info */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{startup.name}</span>
          </div>
          {startup.isLaunched && (
            <Badge variant="default" className="bg-green-600 text-xs">
              Live
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${STAGE_COLORS[startup.stage] || ""}`}
          >
            {startup.stage}
          </Badge>
        </div>

        {/* Right: Workspace Switcher + User */}
        <div className="flex items-center gap-3">
          <WorkspaceSwitcher currentStartupId={startup.id} />
          <Separator orientation="vertical" className="h-6" />
          <UserNav user={session?.user} />
        </div>
      </div>
    </header>
  );
}
