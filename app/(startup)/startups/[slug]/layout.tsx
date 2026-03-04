import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MobileStartupNav } from "@/components/layout/mobile-startup-nav";
import { StartupSidebar } from "@/components/layout/startup-sidebar";
import { StartupWorkspaceHeader } from "@/components/layout/startup-workspace-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess, hasPermission } from "@/lib/startup-permissions";

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
    <div className="relative flex h-screen flex-col overflow-hidden">
      <StartupWorkspaceHeader startup={startup} />
      <div className="flex-1 h-full overflow-hidden items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <div className="h-full hidden md:flex">
          <StartupSidebar
            startup={startup}
            permissions={permissions}
            className="h-full"
          />
        </div>

        {/* Mobile Navigation */}
        <MobileStartupNav startup={startup} permissions={permissions} />

        {/* Main Content */}
        <main className="flex w-full h-full overflow-auto flex-col pt-6 px-6 items-center">
          <div className="max-w-7xl h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
