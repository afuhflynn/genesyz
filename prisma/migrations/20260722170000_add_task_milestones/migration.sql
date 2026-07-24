CREATE TABLE "task_milestones" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_milestones_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tasks" ADD COLUMN "milestoneId" TEXT;

CREATE INDEX "task_milestones_startupId_idx" ON "task_milestones"("startupId");
CREATE INDEX "task_milestones_targetDate_idx" ON "task_milestones"("targetDate");
CREATE INDEX "tasks_milestoneId_idx" ON "tasks"("milestoneId");

ALTER TABLE "task_milestones"
ADD CONSTRAINT "task_milestones_startupId_fkey"
FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_milestoneId_fkey"
FOREIGN KEY ("milestoneId") REFERENCES "task_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
