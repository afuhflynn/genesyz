import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess, hasPermission } from "@/lib/startup-permissions";
import { StartupLayoutShell } from "./layout-shell";

interface StartupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function StartupLayout({
  children,
  params,
}: StartupLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    notFound();
  }

  const { slug } = await params;

  const access = await checkStartupAccess(slug, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    notFound();
  }

  const startup = await db.startup.findUnique({
    where: {
      id: access.startupId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isLaunched: true,
      stage: true,
    },
  });

  if (!startup) {
    notFound();
  }

  const role = access.role;

  if (!role) {
    notFound();
  }

  const permissions = {
    canViewStartup: hasPermission(role, "view_startup"),
    canManageTasks: hasPermission(role, "manage_tasks"),
    canViewSettings: hasPermission(role, "view_settings"),
  };

  return (
    <StartupLayoutShell startup={startup} permissions={permissions}>
      {children}
    </StartupLayoutShell>
  );
}
