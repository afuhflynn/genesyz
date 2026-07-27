-- DropIndex
DROP INDEX IF EXISTS "certificates_userId_idx";

-- DropIndex
DROP INDEX IF EXISTS "enrollments_userId_idx";

-- DropIndex
DROP INDEX IF EXISTS "growth_events_startupId_channel_idx";

-- AlterTable
ALTER TABLE "course_assignments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "growth_campaigns" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "growth_experiments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lesson_progress" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "streaks" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workspace_files" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "priority" "TaskPriority" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "lecture_progress" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "lecture_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lecture_progress_startupId_idx" ON "lecture_progress"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lecture_progress_startupId_lectureId_key" ON "lecture_progress"("startupId", "lectureId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "certificates_verificationCode_idx" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "courses_slug_idx" ON "courses"("slug");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lecture_progress_startupId_fkey') THEN
    ALTER TABLE "lecture_progress" ADD CONSTRAINT "lecture_progress_startupId_fkey"
    FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
