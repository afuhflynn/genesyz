import { Polar } from "@polar-sh/sdk";

// Initialize Polar client
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Plan configuration
export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    maxActiveIdeas: 3,
    polarProductId: process.env.NEXT_PUBLIC_POLAR_FREE_PRODUCT_ID,
    features: [
      "Up to 3 active ideas",
      "Full 6-agent AI research pipeline",
      "Startup execution tracker with AI Coach",
      "Kanban task boards",
      "Team collaboration",
      "Opportunities board",
      "Accelerator hub access",
      "PDF exports",
    ],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    maxActiveIdeas: Infinity,
    polarProductId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID,
    price: "$20/month",
    features: [
      "Unlimited ideas",
      "Full 6-agent AI research pipeline",
      "Startup execution tracker with AI Coach",
      "Kanban task boards",
      "Team collaboration",
      "Opportunities board",
      "Accelerator hub access",
      "PDF exports",
      "Priority support",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Workspace plans are organization-owned. A startup inherits its organization's
// plan and may receive a smaller allocation through StartupEntitlement.
export const WORKSPACE_PLANS = {
  EXPLORER: {
    id: "EXPLORER",
    name: "Explorer",
    polarProductId: undefined,
    price: "$0/month",
    seats: 1,
    maxStartups: 1,
    aiCredits: 100,
    builderCredits: 0,
    hostingCredits: 0,
    hostedProjectLimit: 0,
    storageBytes: 262144000,
    capabilities: { builder: false, hosting: false, growthOS: true, advancedAI: false, exports: true, lmsAnalytics: false },
    features: ["Personal workspace", "Core learning paths", "Basic tasks", "250 MB storage"],
  },
  FOUNDER: {
    id: "FOUNDER",
    name: "Founder",
    polarProductId: process.env.NEXT_PUBLIC_POLAR_FOUNDER_PRODUCT_ID,
    price: "$19/month",
    seats: 1,
    maxStartups: 1,
    aiCredits: 500,
    builderCredits: 50,
    hostingCredits: 0,
    hostedProjectLimit: 0,
    storageBytes: 2147483648,
    capabilities: { builder: true, hosting: false, growthOS: true, advancedAI: false, exports: true, lmsAnalytics: false },
    features: [
      "Full startup workspace",
      "VC Coach",
      "Growth experiments",
      "Prototype builder",
    ],
  },
  TEAM: {
    id: "TEAM",
    name: "Team",
    polarProductId: process.env.NEXT_PUBLIC_POLAR_TEAM_PRODUCT_ID,
    price: "$59/month",
    seats: 10,
    maxStartups: 5,
    aiCredits: 2500,
    builderCredits: 250,
    hostingCredits: 100,
    hostedProjectLimit: 5,
    storageBytes: 26843545600,
    capabilities: { builder: true, hosting: true, growthOS: true, advancedAI: false, exports: true, lmsAnalytics: true },
    features: [
      "Team collaboration",
      "Shared learning progress",
      "Hosted prototypes",
    ],
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth",
    polarProductId: process.env.NEXT_PUBLIC_POLAR_GROWTH_PRODUCT_ID,
    price: "$149/month",
    seats: 25,
    maxStartups: 15,
    aiCredits: 10000,
    builderCredits: 1000,
    hostingCredits: 500,
    hostedProjectLimit: 15,
    storageBytes: 107374182400,
    capabilities: { builder: true, hosting: true, growthOS: true, advancedAI: true, exports: true, lmsAnalytics: true },
    features: [
      "Advanced GrowthOS",
      "Marketing diagnostics",
      "Priority AI capacity",
    ],
  },
  ACCELERATOR: {
    id: "ACCELERATOR",
    name: "Accelerator",
    polarProductId: process.env.NEXT_PUBLIC_POLAR_ACCELERATOR_PRODUCT_ID,
    price: "Custom",
    seats: 100,
    maxStartups: 100,
    aiCredits: 50000,
    builderCredits: 5000,
    hostingCredits: 2500,
    hostedProjectLimit: 100,
    storageBytes: 536870912000,
    capabilities: { builder: true, hosting: true, growthOS: true, advancedAI: true, exports: true, lmsAnalytics: true },
    features: [
      "Cohort administration",
      "Portfolio analytics",
      "Institutional support",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    polarProductId: process.env.NEXT_PUBLIC_POLAR_ENTERPRISE_PRODUCT_ID,
    price: "Custom",
    seats: 1000,
    maxStartups: 1000,
    aiCredits: 100000,
    builderCredits: 10000,
    hostingCredits: 10000,
    hostedProjectLimit: 1000,
    storageBytes: 2199023255552,
    capabilities: { builder: true, hosting: true, growthOS: true, advancedAI: true, exports: true, lmsAnalytics: true },
    features: [
      "Custom controls",
      "SSO and audit support",
      "Dedicated infrastructure",
    ],
  },
} as const;

export type WorkspacePlanId = keyof typeof WORKSPACE_PLANS;
