import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex-1 h-full overflow-hidden items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="h-full hidden md:flex">
          <Sidebar className=" h-full" />
        </div>

        <main className="flex w-full h-full overflow-auto flex-col pt-8 px-6 items-center">
          <div className=" h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
