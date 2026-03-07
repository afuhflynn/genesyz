import { Suspense } from "react";
import { notFound } from "next/navigation";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Settings,
  Shield,
} from "lucide-react";
import { TeamManagement } from "@/components/accelerators/team-management";
import { CohortManagement } from "@/components/accelerators/cohort-management";
import { EventManagement } from "@/components/accelerators/event-management";
import { MentorManagement } from "@/components/accelerators/mentor-management";
import { KpiReporting } from "@/components/accelerators/kpi-reporting";
import { HubCoach } from "@/components/accelerators/hub-coach";

async function getAcceleratorData(slug: string) {
  const accelerator = await db.accelerator.findUnique({
    where: { slug },
    include: {
      cohorts: {
        where: { isActive: true },
        include: {
          _count: { select: { startups: true } },
          startups: {
            include: {
              startup: {
                include: {
                  weeklyUpdates: {
                    orderBy: { weekNumber: "desc" },
                    take: 1,
                  },
                  flags: {
                    where: { status: "active" },
                  },
                },
              },
            },
          },
        },
      },
      kpis: true,
      _count: {
        select: {
          members: true,
          applications: true,
        },
      },
    },
  });

  if (!accelerator) return null;

  // Calculate some aggregate metrics
  const totalStartups = accelerator.cohorts.reduce(
    (acc, c) => acc + c._count.startups,
    0,
  );
  const activeFlags = accelerator.cohorts.reduce((acc, c) => {
    return (
      acc + c.startups.reduce((sAcc, s) => sAcc + s.startup.flags.length, 0)
    );
  }, 0);

  return { accelerator, totalStartups, activeFlags };
}

export default async function AcceleratorDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { hasAccess, role } = await checkAcceleratorAccess(
    slug,
    "view_metrics",
  );

  if (!hasAccess) {
    return notFound();
  }

  const data = await getAcceleratorData(slug);
  if (!data) return notFound();

  const { accelerator, totalStartups, activeFlags } = data;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {accelerator.name}
          </h1>
          <p className="text-muted-foreground">
            {accelerator.programType.charAt(0).toUpperCase() +
              accelerator.programType.slice(1)}{" "}
            Dashboard • {role?.replace("_", " ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="mr-2 h-4 w-4" />
            {role}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Startups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStartups}</div>
            <p className="text-xs text-muted-foreground">
              Across {accelerator.cohorts.length} active cohorts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {activeFlags}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Index</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Cohort average WoW growth
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accelerator._count.applications}
            </div>
            <p className="text-xs text-muted-foreground">
              Next intake applications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <HubCoach slug={slug} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Cohort Performance</CardTitle>
                <CardDescription>
                  Aggregate metrics across all active startups.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Chart Placeholder: Revenue & Growth Metrics
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>KPI Tracking</CardTitle>
                <CardDescription>
                  Hub-level goals set by managers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accelerator.kpis.length > 0 ? (
                    accelerator.kpis.map((kpi) => (
                      <div key={kpi.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{kpi.name}</span>
                          <span className="text-muted-foreground">
                            {kpi.currentValue} / {kpi.targetValue} {kpi.unit}
                          </span>
                        </div>
                        <Progress
                          value={(kpi.currentValue / kpi.targetValue) * 100}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-center py-4 text-muted-foreground">
                      No KPIs defined yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Flagged Startups</CardTitle>
                <CardDescription>
                  Startups requiring intervention due to missed updates or poor
                  metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accelerator.cohorts
                    .flatMap((c) => c.startups)
                    .filter((s) => s.startup.flags.length > 0).length > 0 ? (
                    accelerator.cohorts
                      .flatMap((c) => c.startups)
                      .filter((s) => s.startup.flags.length > 0)
                      .map((s) => (
                        <div
                          key={s.startup.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {s.startup.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.startup.flags[0].reason}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                s.startup.flags[0].severity === "critical"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {s.startup.flags[0].severity}
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-center py-8 text-muted-foreground">
                      All startups are currently healthy.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts">
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>Cohort Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CohortManagement slug={slug} currentRole={role || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>Program Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <EventManagement slug={slug} currentRole={role || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors">
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>Mentor Network</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <MentorManagement slug={slug} currentRole={role || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TeamManagement slug={slug} currentRole={role || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>KPIs & Reporting</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <KpiReporting slug={slug} currentRole={role || ""} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accelerator Profile</CardTitle>
              <CardDescription>
                Update your program branding and public visibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-12">
                General program settings are being migrated to this section.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
