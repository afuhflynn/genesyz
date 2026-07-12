/*
  Warnings:

  - Made the column `location` on table `startups` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AcceleratorRole" AS ENUM ('OWNER', 'PROGRAM_MANAGER', 'OPERATIONS_LEAD', 'MENTOR', 'OBSERVER');

-- CreateEnum
CREATE TYPE "ResearchFeedType" AS ENUM ('IDEA_RESEARCH', 'WEEKLY_REPORT', 'WEEKLY_DIGEST', 'WEEKLY_REMINDER');

-- AlterTable
ALTER TABLE "startups" ADD COLUMN     "locationContext" JSONB,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "location" SET DEFAULT '';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location" TEXT,
ADD COLUMN     "locationContext" JSONB;

-- CreateTable
CREATE TABLE "startup_conversations" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_followers" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "startup_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerator_members" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AcceleratorRole" NOT NULL DEFAULT 'PROGRAM_MANAGER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accelerator_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerator_invitations" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AcceleratorRole" NOT NULL DEFAULT 'PROGRAM_MANAGER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accelerator_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerator_kpis" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accelerator_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accelerator_weekly_reports" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metrics" JSONB,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accelerator_weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_flags" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "status" TEXT NOT NULL DEFAULT 'active',
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentors" (
    "id" TEXT NOT NULL,
    "acceleratorId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expertise" TEXT[],
    "bio" TEXT,
    "linkedIn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_matches" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "focus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendance" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rsvp',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendance_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "research_feed_items" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "ideaId" TEXT,
    "type" "ResearchFeedType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "startup_conversations_startupId_idx" ON "startup_conversations"("startupId");

-- CreateIndex
CREATE INDEX "startup_conversations_isActive_idx" ON "startup_conversations"("isActive");

-- CreateIndex
CREATE INDEX "startup_messages_conversationId_idx" ON "startup_messages"("conversationId");

-- CreateIndex
CREATE INDEX "startup_messages_createdAt_idx" ON "startup_messages"("createdAt");

-- CreateIndex
CREATE INDEX "startup_followers_startupId_idx" ON "startup_followers"("startupId");

-- CreateIndex
CREATE INDEX "startup_followers_email_idx" ON "startup_followers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "startup_followers_startupId_email_key" ON "startup_followers"("startupId", "email");

-- CreateIndex
CREATE INDEX "accelerator_members_userId_idx" ON "accelerator_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accelerator_members_acceleratorId_userId_key" ON "accelerator_members"("acceleratorId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "accelerator_invitations_token_key" ON "accelerator_invitations"("token");

-- CreateIndex
CREATE INDEX "accelerator_invitations_acceleratorId_idx" ON "accelerator_invitations"("acceleratorId");

-- CreateIndex
CREATE INDEX "accelerator_invitations_email_idx" ON "accelerator_invitations"("email");

-- CreateIndex
CREATE INDEX "accelerator_kpis_acceleratorId_idx" ON "accelerator_kpis"("acceleratorId");

-- CreateIndex
CREATE INDEX "accelerator_weekly_reports_acceleratorId_idx" ON "accelerator_weekly_reports"("acceleratorId");

-- CreateIndex
CREATE INDEX "startup_flags_startupId_idx" ON "startup_flags"("startupId");

-- CreateIndex
CREATE INDEX "mentors_acceleratorId_idx" ON "mentors"("acceleratorId");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_matches_mentorId_startupId_key" ON "mentor_matches"("mentorId", "startupId");

-- CreateIndex
CREATE UNIQUE INDEX "research_feed_items_idempotencyKey_key" ON "research_feed_items"("idempotencyKey");

-- CreateIndex
CREATE INDEX "research_feed_items_startupId_idx" ON "research_feed_items"("startupId");

-- CreateIndex
CREATE INDEX "research_feed_items_type_idx" ON "research_feed_items"("type");

-- CreateIndex
CREATE INDEX "research_feed_items_createdAt_idx" ON "research_feed_items"("createdAt");

-- AddForeignKey
ALTER TABLE "startup_conversations" ADD CONSTRAINT "startup_conversations_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_messages" ADD CONSTRAINT "startup_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "startup_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_followers" ADD CONSTRAINT "startup_followers_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_members" ADD CONSTRAINT "accelerator_members_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_members" ADD CONSTRAINT "accelerator_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_invitations" ADD CONSTRAINT "accelerator_invitations_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_kpis" ADD CONSTRAINT "accelerator_kpis_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accelerator_weekly_reports" ADD CONSTRAINT "accelerator_weekly_reports_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_flags" ADD CONSTRAINT "startup_flags_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_acceleratorId_fkey" FOREIGN KEY ("acceleratorId") REFERENCES "accelerators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_matches" ADD CONSTRAINT "mentor_matches_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_matches" ADD CONSTRAINT "mentor_matches_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "accelerator_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_feed_items" ADD CONSTRAINT "research_feed_items_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_feed_items" ADD CONSTRAINT "research_feed_items_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
