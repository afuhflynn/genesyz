import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MobileStartupNav } from "@/components/layout/mobile-startup-nav";
import { StartupSidebar } from "@/components/layout/startup-sidebar";
import { StartupWorkspaceHeader } from "@/components/layout/startup-workspace-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      userId: session.user.id,
      isActive: true,
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

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <StartupWorkspaceHeader startup={startup} />
      <div className="flex-1 h-full overflow-hidden items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <div className="h-full hidden md:flex">
          <StartupSidebar startup={startup} className="h-full" />
        </div>

        {/* Mobile Navigation */}
        <MobileStartupNav startup={startup} />

        {/* Main Content */}
        <main className="flex w-full h-full overflow-auto flex-col pt-6 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
