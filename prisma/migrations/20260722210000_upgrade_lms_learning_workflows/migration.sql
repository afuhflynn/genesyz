ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "revocationReason" TEXT;

CREATE TABLE IF NOT EXISTS "course_assignments" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "course_assignments_organizationId_courseId_assigneeId_key" ON "course_assignments"("organizationId", "courseId", "assigneeId");
CREATE INDEX IF NOT EXISTS "course_assignments_organizationId_status_idx" ON "course_assignments"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "course_assignments_courseId_idx" ON "course_assignments"("courseId");
CREATE INDEX IF NOT EXISTS "course_assignments_assigneeId_idx" ON "course_assignments"("assigneeId");
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_assignments" ADD CONSTRAINT "course_assignments_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "learning_activities" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "activityDate" TIMESTAMP(3) NOT NULL,
  "activityType" TEXT NOT NULL,
  "sourceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learning_activities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "learning_activities_userId_activityDate_key" ON "learning_activities"("userId", "activityDate");
CREATE INDEX IF NOT EXISTS "learning_activities_userId_activityDate_idx" ON "learning_activities"("userId", "activityDate");
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
