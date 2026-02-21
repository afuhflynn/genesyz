import { z } from "zod";

export const startupStageSchema = z.enum([
  "IDEA",
  "VALIDATION",
  "BUILDING",
  "LAUNCHED",
  "SCALING",
]);

export const targetMarketSchema = z.enum(["CONSUMER", "SMB", "ENTERPRISE"]);

export const primaryMetricTypeSchema = z.enum([
  "MRR",
  "ARR",
  "GROSS_REVENUE",
  "NET_REVENUE",
  "TAKE_RATE",
  "SOFTWARE_SALES",
  "HARDWARE_SALES",
  "PREORDER_SALES",
  "LETTERS_OF_INTENT",
  "PAID_TRIALS",
  "PAID_CONTRACTS",
  "ECOMMERCE_SALES",
  "MARKETPLACE_VOLUME",
  "TRANSACTION_VOLUME",
  "ASSETS_UNDER_MANAGEMENT",
  "DAU",
  "WAU",
  "MAU",
  "PAYING_CUSTOMERS",
  "NEW_SIGNUPS",
  "RETENTION_RATE",
  "CHURN_RATE",
  "GMV",
  "COMPLETED_ORDERS",
  "BOOKINGS",
  "UNITS_SOLD",
  "WEEK_OVER_WEEK_GROWTH",
  "MONTH_OVER_MONTH_GROWTH",
  "SIGNED_CONTRACTS",
  "PIPELINE_VALUE",
  "PRODUCT_MILESTONES",
  "USER_CONVERSATIONS",
  "WAITLIST_SIGNUPS",
  "CUSTOM",
]);

export const metricPeriodSchema = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

export const metricFormatSchema = z.enum(["CURRENCY", "PERCENTAGE", "NUMBER"]);

export const additionalMetricSchema = z.object({
  type: primaryMetricTypeSchema,
  value: z.number().min(0),
  period: metricPeriodSchema.optional().nullable(),
  customMetricName: z.string().max(100).optional().nullable(),
});

export const previousGoalReviewSchema = z.object({
  goalText: z.string(),
  completed: z.boolean(),
});

export const createStartupSchema = z.object({
  ideaId: z.string().cuid(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  tagline: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  industry: z.string().max(100).optional(),
  stage: startupStageSchema.optional(),
  targetMarket: targetMarketSchema.optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
});

export const updateStartupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    )
    .optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  industry: z.string().max(100).optional(),
  stage: startupStageSchema.optional(),
  targetMarket: targetMarketSchema.optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  isLaunched: z.boolean().optional(),
  launchDate: z.coerce.date().optional().nullable(),
  weeksToLaunch: z.number().int().min(0).optional().nullable(),
  primaryMetricType: primaryMetricTypeSchema.optional(),
  primaryMetricValue: z.number().min(0).optional().nullable(),
  primaryMetricTarget: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const weeklyGoalSchema = z.object({
  content: z.string().min(1, "Goal cannot be empty").max(500),
  priority: z.number().int().min(1).max(3),
  completed: z.boolean().optional(),
});

export const createWeeklyUpdateSchema = z.object({
  isLaunched: z.boolean(),
  weeksToLaunch: z.number().int().min(0).optional().nullable(),
  usersTalkedTo: z.number().int().min(0),
  userLearnings: z
    .string()
    .min(10, "Please share at least 10 characters about what you learned")
    .max(5000),
  primaryMetricType: primaryMetricTypeSchema,
  primaryMetricValue: z.number().min(0),
  metricPeriod: metricPeriodSchema.optional().nullable(),
  metricFormat: metricFormatSchema.optional().nullable(),
  customMetricName: z.string().max(100).optional().nullable(),
  additionalMetrics: z
    .array(additionalMetricSchema)
    .max(5)
    .optional()
    .nullable(),
  previousGoalsReview: z.array(previousGoalReviewSchema).optional().nullable(),
  goalsCompletionRate: z.number().min(0).max(1).optional().nullable(),
  moraleScore: z.number().int().min(1).max(10),
  topImprovements: z.string().max(5000).optional(),
  biggestObstacle: z.string().max(5000).optional(),
  goals: z
    .array(weeklyGoalSchema)
    .min(1, "Add at least 1 goal")
    .max(3, "Maximum 3 goals allowed"),
});

export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type CreateWeeklyUpdateInput = z.infer<typeof createWeeklyUpdateSchema>;
export type WeeklyGoalInput = z.infer<typeof weeklyGoalSchema>;
export type CheckSlugInput = z.infer<typeof checkSlugSchema>;
export type AdditionalMetricInput = z.infer<typeof additionalMetricSchema>;
export type PreviousGoalReviewInput = z.infer<typeof previousGoalReviewSchema>;
export type MetricPeriod = z.infer<typeof metricPeriodSchema>;
export type MetricFormat = z.infer<typeof metricFormatSchema>;
