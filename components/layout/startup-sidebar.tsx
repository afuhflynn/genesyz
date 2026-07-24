"use client";

import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaceNavigation } from "@/hooks/use-workspace";
import { type NavigationItem, startupNavigation } from "@/lib/navigation";
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
    role?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
    canViewStartup: boolean;
    canManageTasks: boolean;
    canManageTeam?: boolean;
    canViewSettings: boolean;
  };
}

function hasPermission(
  item: NavigationItem,
  permissions: StartupSidebarProps["permissions"],
) {
  if (!item.permission) return true;
  if (item.permission === "view_startup") return permissions.canViewStartup;
  if (item.permission === "manage_tasks") return permissions.canManageTasks;
  if (item.permission === "manage_team")
    return permissions.canManageTeam ?? false;
  return permissions.canViewSettings;
}

export function StartupSidebar({
  startup,
  permissions,
  className,
}: StartupSidebarProps) {
  const pathname = usePathname();
  const { data: workspace } = useWorkspaceNavigation();
  const capabilities = workspace?.entitlement.capabilities;
  const items = startupNavigation(startup.slug).filter((item) =>
    hasPermission(item, permissions),
  );
  const groups = items.reduce<Record<string, NavigationItem[]>>(
    (result, item) => {
      if (!result[item.section]) result[item.section] = [];
      result[item.section].push(item);
      return result;
    },
    {},
  );

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Back to workspace" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium">
                  Back to workspace
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
          <p className="truncate text-sm font-semibold">{startup.name}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {permissions.role
              ? `${permissions.role.toLowerCase()} access`
              : "Startup workspace"}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("px-1", className)}>
        {Object.entries(groups).map(([label, group]) => (
          <SidebarGroup key={label} className="py-2">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.map((item) => {
                  const Icon = item.icon;
                  const locked = Boolean(
                    item.capability &&
                      capabilities &&
                      capabilities[item.capability] !== true,
                  );
                  const href = locked
                    ? `/billing?feature=${item.capability}`
                    : item.href;
                  return (
                    <SidebarMenuItem key={item.href + item.label}>
                      <SidebarMenuButton
                        tooltip={
                          locked
                            ? `${item.label} — upgrade to unlock`
                            : item.label
                        }
                        isActive={!locked && item.active(pathname)}
                        asChild
                        className={
                          locked
                            ? "text-muted-foreground/60 hover:text-foreground"
                            : undefined
                        }
                      >
                        <Link
                          href={href}
                          aria-label={
                            locked
                              ? `${item.label} is locked. View plans.`
                              : item.label
                          }
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden flex-1 truncate">
                            {item.label}
                          </span>
                          {locked && (
                            <LockKeyhole className="ml-auto h-3.5 w-3.5 shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </>
  );
}
