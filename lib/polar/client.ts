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
