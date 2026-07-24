"use client";

import { LockKeyhole, LogOut } from "lucide-react";
import Image from "next/image";
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
import { useWorkspaceNavigation } from "@/hooks/use-workspace";
import { signOut } from "@/lib/auth-client";
import {
  adminNavigation,
  globalNavigation,
  type NavigationItem,
} from "@/lib/navigation";

function NavigationRow({
  item,
  locked = false,
  pathname,
}: {
  item: NavigationItem;
  locked?: boolean;
  pathname: string;
}) {
  const Icon = item.icon;
  const href = locked ? `/billing?feature=${item.capability}` : item.href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={locked ? `${item.label} — upgrade to unlock` : item.label}
        isActive={!locked && item.active(pathname)}
        asChild
        className={
          locked ? "text-muted-foreground/60 hover:text-foreground" : undefined
        }
      >
        <Link
          href={href}
          aria-label={
            locked ? `${item.label} is locked. View plans.` : item.label
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden flex-1 truncate">
            {item.label}
          </span>
          {locked && <LockKeyhole className="ml-auto h-3.5 w-3.5 shrink-0" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavigationGroup({
  label,
  items,
  capabilities,
  pathname,
}: {
  label: string;
  items: NavigationItem[];
  capabilities?: Record<string, boolean>;
  pathname: string;
}) {
  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavigationRow
              key={item.href + item.label}
              item={item}
              pathname={pathname}
              locked={Boolean(
                item.capability &&
                  capabilities &&
                  capabilities[item.capability] !== true,
              )}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useProfile();
  const { data: workspace } = useWorkspaceNavigation();
  const capabilities = workspace?.entitlement.capabilities;
  const grouped = globalNavigation.reduce<Record<string, NavigationItem[]>>(
    (groups, item) => {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
      return groups;
    },
    {},
  );

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-1 py-1"
        >
          <Image
            src="/icon.png"
            alt="Genesyz Logo"
            width={32}
            height={32}
            className="aspect-square shrink-0 object-contain"
          />
          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden truncate">
            Genesyz
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Workspace
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {workspace?.entitlement.plan ?? "Your workspace"}
            </span>
            {user?.role === "ADMIN" && (
              <span className="text-[10px] font-semibold uppercase text-primary">
                Platform admin
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {Object.entries(grouped).map(([label, items]) => (
          <NavigationGroup
            key={label}
            label={label}
            items={items}
            capabilities={capabilities}
            pathname={pathname}
          />
        ))}

        {user?.role === "ADMIN" && (
          <div className="mt-2 border-t border-sidebar-border pt-2">
            <NavigationGroup
              label="Admin console"
              items={adminNavigation}
              capabilities={capabilities}
              pathname={pathname}
            />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() =>
                signOut({
                  fetchOptions: { onSuccess: () => router.push("/sign-in") },
                })
              }
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
