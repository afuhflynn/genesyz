import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  CreditCard,
  FileText,
  GraduationCap,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  LockKeyhole,
  Medal,
  MessageSquare,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Users,
  UsersRound,
  Wrench,
} from "lucide-react";

export type NavigationCapability =
  | "builder"
  | "hosting"
  | "growthOS"
  | "advancedAI"
  | "exports"
  | "lmsAnalytics";

export type StartupNavigationPermission =
  | "view_startup"
  | "manage_tasks"
  | "manage_team"
  | "view_settings";

export type NavigationItem = {
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  section: string;
  capability?: NavigationCapability;
  permission?: StartupNavigationPermission;
  active: (pathname: string) => boolean;
};

export const globalNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
    active: (p) => p === "/dashboard",
  },
  {
    label: "My Ideas",
    href: "/ideas",
    icon: Lightbulb,
    section: "Workspace",
    active: (p) =>
      p === "/ideas" ||
      (p.startsWith("/ideas/") && !p.startsWith("/ideas/archived")),
  },
  {
    label: "Startups",
    href: "/startups",
    icon: Building2,
    section: "Workspace",
    active: (p) => p === "/startups" || p.startsWith("/startups/new"),
  },
  {
    label: "Archived Ideas",
    href: "/ideas/archived",
    icon: Archive,
    section: "Account",
    active: (p) => p.startsWith("/ideas/archived"),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
    section: "Account",
    active: (p) => p.startsWith("/billing"),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    section: "Account",
    active: (p) => p.startsWith("/settings"),
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: Shield,
    section: "Admin",
    active: (p) => p === "/admin",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    section: "Admin",
    active: (p) => p.startsWith("/admin/users"),
  },
  {
    label: "Courses",
    href: "/admin/lms",
    icon: BookOpen,
    section: "Admin",
    active: (p) =>
      p.startsWith("/admin/lms") && !p.startsWith("/admin/lms/analytics"),
  },
  {
    label: "LMS Analytics",
    href: "/admin/lms/analytics",
    icon: BarChart3,
    section: "Admin",
    active: (p) => p.startsWith("/admin/lms/analytics"),
  },
];

export function startupNavigation(slug: string): NavigationItem[] {
  const base = `/startups/${slug}`;
  return [
    {
      label: "Overview",
      href: base,
      icon: LayoutDashboard,
      section: "Operate",
      permission: "view_startup",
      active: (p) => p === base,
    },
    {
      label: "VC",
      description: "Think through the next decision",
      href: `${base}/chat`,
      icon: MessageSquare,
      section: "Operate",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/chat`),
    },
    // {
    //   label: "Research Feed",
    //   href: `${base}/research-feed`,
    //   icon: Sparkles,
    //   section: "Operate",
    //   permission: "view_startup",
    //   active: (p) => p.startsWith(`${base}/research-feed`),
    // },
    {
      label: "Weekly Updates",
      href: `${base}/updates`,
      icon: FileText,
      section: "Operate",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/updates`),
    },
    {
      label: "Tasks",
      href: `${base}/tasks`,
      icon: CheckSquare,
      section: "Operate",
      permission: "manage_tasks",
      active: (p) => p.startsWith(`${base}/tasks`),
    },
    {
      label: "Streaks",
      href: `${base}/streaks`,
      icon: Medal,
      section: "Operate",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/streaks`),
    },
    {
      label: "School",
      description: "Learn and apply founder fundamentals",
      href: `${base}/school`,
      icon: GraduationCap,
      section: "Learn",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/school`),
    },
    // {
    //   label: "GrowthOS",
    //   description: "Run experiments and learn faster",
    //   href: `${base}/growth-labs`,
    //   icon: FlaskConical,
    //   section: "Grow",
    //   capability: "growthOS",
    //   permission: "view_startup",
    //   active: (p) => p.startsWith(`${base}/growth-labs`),
    // },
    // {
    //   label: "Metrics",
    //   href: `${base}/metrics`,
    //   icon: LineChart,
    //   section: "Grow",
    //   capability: "advancedAI",
    //   permission: "view_startup",
    //   active: (p) => p.startsWith(`${base}/metrics`),
    // },
    {
      label: "Opportunities",
      href: `${base}/opportunities`,
      icon: BriefcaseBusiness,
      section: "Grow",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/opportunities`),
    },
    // {
    //   label: "Builder",
    //   description: "Turn an idea into a prototype",
    //   href: `${base}/builder`,
    //   icon: Rocket,
    //   section: "Build",
    //   capability: "builder",
    //   permission: "view_startup",
    //   active: (p) => p.startsWith(`${base}/builder`),
    // },
    {
      label: "Team",
      href: `${base}/settings`,
      icon: UsersRound,
      section: "Manage",
      permission: "manage_team",
      active: (p) => p.startsWith(`${base}/settings`),
    },
    {
      label: "Profile",
      href: `${base}/profile`,
      icon: Building2,
      section: "Manage",
      permission: "view_startup",
      active: (p) => p.startsWith(`${base}/profile`),
    },
  ];
}

export const LockedIcon = LockKeyhole;
