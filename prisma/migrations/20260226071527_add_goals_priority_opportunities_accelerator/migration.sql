-- CreateEnum
CREATE TYPE "UrlContentStatus" AS ENUM ('PENDING', 'SCRAPED', 'FAILED');

-- CreateEnum
CREATE TYPE "GuideMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('IDEA', 'VALIDATION', 'BUILDING', 'LAUNCHED', 'SCALING');

-- CreateEnum
CREATE TYPE "TargetMarket" AS ENUM ('CONSUMER', 'SMB', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PrimaryMetricType" AS ENUM ('MRR', 'ARR', 'GROSS_REVENUE', 'NET_REVENUE', 'TAKE_RATE', 'SOFTWARE_SALES', 'HARDWARE_SALES', 'PREORDER_SALES', 'LETTERS_OF_INTENT', 'PAID_TRIALS', 'PAID_CONTRACTS', 'ECOMMERCE_SALES', 'MARKETPLACE_VOLUME', 'TRANSACTION_VOLUME', 'ASSETS_UNDER_MANAGEMENT', 'DAU', 'WAU', 'MAU', 'PAYING_CUSTOMERS', 'NEW_SIGNUPS', 'RETENTION_RATE', 'CHURN_RATE', 'GMV', 'COMPLETED_ORDERS', 'BOOKINGS', 'UNITS_SOLD', 'WEEK_OVER_WEEK_GROWTH', 'MONTH_OVER_MONTH_GROWTH', 'SIGNED_CONTRACTS', 'PIPELINE_VALUE', 'PRODUCT_MILESTONES', 'USER_CONVERSATIONS', 'WAITLIST_SIGNUPS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MetricPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "MetricFormat" AS ENUM ('CURRENCY', 'PERCENTAGE', 'NUMBER');

-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('FELLOWSHIP', 'SCHOLARSHIP', 'FUNDING', 'COMPETITION', 'ACCELERATOR', 'GRANT', 'MENTORSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DISCOVERED', 'BOOKMARKED', 'TO_APPLY', 'APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResearchAgentType" ADD VALUE 'DEEP_RESEARCH';
ALTER TYPE "ResearchAgentType" ADD VALUE 'STRATEGIC_ADVISORY';

-- AlterTable
ALTER TABLE "idea_inputs" ADD COLUMN     "extractedUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ideas" ADD COLUMN     "assumptions" JSONB,
ADD COLUMN     "extractedUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "founderGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "interpretedPrompt" TEXT,
ADD COLUMN     "locationContext" JSONB,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "originalPrompt" TEXT,
ADD COLUMN     "state" JSONB,
ADD COLUMN     "targetLocation" TEXT;

-- CreateTable
CREATE TABLE "idea_snapshots" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" JSONB NOT NULL,
    "verdict" JSONB NOT NULL,
    "deltas" JSONB,

    CONSTRAINT "idea_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_contents" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "UrlContentStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "url_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredResearch" BOOLEAN NOT NULL DEFAULT false,
    "editedBy" TEXT,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_conversations" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "GuideMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "stage" "StartupStage" NOT NULL DEFAULT 'IDEA',
    "targetMarket" "TargetMarket",
    "logoUrl" TEXT,
    "website" TEXT,
    "location" TEXT,
    "isLaunched" BOOLEAN NOT NULL DEFAULT false,
    "launchDate" TIMESTAMP(3),
    "weeksToLaunch" INTEGER,
    "primaryMetricType" "PrimaryMetricType" NOT NULL DEFAULT 'USER_CONVERSATIONS',
    "primaryMetricValue" DOUBLE PRECISION,
    "primaryMetricTarget" DOUBLE PRECISION,
    "currentWeekNumber" INTEGER NOT NULL DEFAULT 1,
    "lastUpdateAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_updates" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "isLaunched" BOOLEAN NOT NULL DEFAULT false,
    "weeksToLaunch" INTEGER,
    "usersTalkedTo" INTEGER NOT NULL DEFAULT 0,
    "userLearnings" TEXT,
    "primaryMetricType" "PrimaryMetricType" NOT NULL DEFAULT 'USER_CONVERSATIONS',
    "primaryMetricValue" DOUBLE PRECISION NOT NULL,
    "primaryMetricDelta" DOUBLE PRECISION,
    "metricPeriod" "MetricPeriod",
    "metricFormat" "MetricFormat",
    "customMetricName" TEXT,
    "additionalMetrics" JSONB,
    "previousGoalsReview" JSONB,
    "goalsCompletionRate" DOUBLE PRECISION,
    "moraleScore" INTEGER NOT NULL,
    "topImprovements" TEXT,
    "biggestObstacle" TEXT,
    "aiAnalysis" JSONB,
    "aiVerdict" TEXT,
    "aiRecommendations" JSONB,
    "editableUntil" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_goals" (
    "id" TEXT NOT NULL,
    "weeklyUpdateId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_metric_entries" (
    "id" TEXT NOT NULL,
    "weeklyUpdateId" TEXT NOT NULL,
    "metricType" "PrimaryMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "weekly_metric_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_metrics" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_goals" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_opportunities" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "OpportunityCategory" NOT NULL,
    "eligibility" TEXT,
    "benefits" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DISCOVERED',
    "appliedAt" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "programType" TEXT NOT NULL DEFAULT 'accelerator',
    "logoUrl" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "durationWeeks" INTEGER,
    "benefits" TEXT,
    "requirements" TEXT,
    "maxStartups" INTEGER,
    "fundingAmount" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accelerators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_startups" (
    "cohortId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_startups_pkey" PRIMARY KEY ("cohortId","startupId")
);

-- CreateTable
CREATE TABLE "accelerator_events" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT,
    "acceleratorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,

    CONSTRAINT "accelerator_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerator_applications" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "startupId" TEXT,
    "founderEmail" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "founderPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "answers" JSONB,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accelerator_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idea_snapshots_ideaId_idx" ON "idea_snapshots"("ideaId");

-- CreateIndex
CREATE INDEX "url_contents_ideaId_idx" ON "url_contents"("ideaId");

-- CreateIndex
CREATE INDEX "url_contents_url_idx" ON "url_contents"("url");

-- CreateIndex
CREATE INDEX "prompt_versions_ideaId_idx" ON "prompt_versions"("ideaId");

-- CreateIndex
CREATE INDEX "prompt_versions_editedAt_idx" ON "prompt_versions"("editedAt");

-- CreateIndex
CREATE INDEX "guide_conversations_ideaId_idx" ON "guide_conversations"("ideaId");

-- CreateIndex
CREATE INDEX "guide_conversations_isActive_idx" ON "guide_conversations"("isActive");

-- CreateIndex
CREATE INDEX "guide_messages_conversationId_idx" ON "guide_messages"("conversationId");

-- CreateIndex
CREATE INDEX "guide_messages_createdAt_idx" ON "guide_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "startups_ideaId_key" ON "startups"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "startups_slug_key" ON "startups"("slug");

-- CreateIndex
CREATE INDEX "startups_userId_idx" ON "startups"("userId");

-- CreateIndex
CREATE INDEX "startups_slug_idx" ON "startups"("slug");

-- CreateIndex
CREATE INDEX "weekly_updates_startupId_idx" ON "weekly_updates"("startupId");

-- CreateIndex
CREATE INDEX "weekly_updates_weekStart_idx" ON "weekly_updates"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_updates_startupId_weekNumber_key" ON "weekly_updates"("startupId", "weekNumber");

-- CreateIndex
CREATE INDEX "weekly_goals_weeklyUpdateId_idx" ON "weekly_goals"("weeklyUpdateId");

-- CreateIndex
CREATE INDEX "weekly_metric_entries_weeklyUpdateId_idx" ON "weekly_metric_entries"("weeklyUpdateId");

-- CreateIndex
CREATE UNIQUE INDEX "startup_metrics_startupId_name_key" ON "startup_metrics"("startupId", "name");

-- CreateIndex
CREATE INDEX "startup_goals_startupId_idx" ON "startup_goals"("startupId");

-- CreateIndex
CREATE INDEX "startup_goals_priority_idx" ON "startup_goals"("priority");

-- CreateIndex
CREATE INDEX "startup_opportunities_startupId_idx" ON "startup_opportunities"("startupId");

-- CreateIndex
CREATE INDEX "startup_opportunities_status_idx" ON "startup_opportunities"("status");

-- CreateIndex
CREATE INDEX "startup_opportunities_category_idx" ON "startup_opportunities"("category");

-- CreateIndex
CREATE UNIQUE INDEX "accelerators_slug_key" ON "accelerators"("slug");

-- CreateIndex
CREATE INDEX "accelerators_slug_idx" ON "accelerators"("slug");

-- CreateIndex
CREATE INDEX "accelerators_ownerId_idx" ON "accelerators"("ownerId");

-- CreateIndex
CREATE INDEX "accelerators_isPublic_idx" ON "accelerators"("isPublic");

-- CreateIndex
CREATE INDEX "cohorts_acceleratorId_idx" ON "cohorts"("acceleratorId");

-- CreateIndex
CREATE INDEX "cohort_startups_startupId_idx" ON "cohort_startups"("startupId");

-- CreateIndex
CREATE INDEX "accelerator_events_acceleratorId_idx" ON "accelerator_events"("acceleratorId");

-- CreateIndex
CREATE INDEX "accelerator_events_cohortId_idx" ON "accelerator_events"("cohortId");

-- CreateIndex
CREATE INDEX "accelerator_events_scheduledAt_idx" ON "accelerator_events"("scheduledAt");

-- CreateIndex
CREATE INDEX "accelerator_applications_acceleratorId_idx" ON "accelerator_applications"("acceleratorId");

-- CreateIndex
CREATE INDEX "accelerator_applications_startupId_idx" ON "accelerator_applications"("startupId");

-- CreateIndex
CREATE INDEX "ideas_targetLocation_idx" ON "ideas"("targetLocation");

-- AddForeignKey
ALTER TABLE "idea_snapshots" ADD CONSTRAINT "idea_snapshots_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_contents" ADD CONSTRAINT "url_contents_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_conversations" ADD CONSTRAINT "guide_conversations_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_messages" ADD CONSTRAINT "guide_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "guide_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_updates" ADD CONSTRAINT "weekly_updates_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_weeklyUpdateId_fkey" FOREIGN KEY ("weeklyUpdateId") REFERENCES "weekly_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_metric_entries" ADD CONSTRAINT "weekly_metric_entries_weeklyUpdateId_fkey" FOREIGN KEY ("weeklyUpdateId") REFERENCES "weekly_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_metrics" ADD CONSTRAINT "startup_metrics_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_goals" ADD CONSTRAINT "startup_goals_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_opportunities" ADD CONSTRAINT "startup_opportunities_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerators" ADD CONSTRAINT "accelerators_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_startups" ADD CONSTRAINT "cohort_startups_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_startups" ADD CONSTRAINT "cohort_startups_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_events" ADD CONSTRAINT "accelerator_events_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_events" ADD CONSTRAINT "accelerator_events_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_applications" ADD CONSTRAINT "accelerator_applications_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_applications" ADD CONSTRAINT "accelerator_applications_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
