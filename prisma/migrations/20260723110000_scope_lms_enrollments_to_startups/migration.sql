ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "startupId" TEXT;

DROP INDEX IF EXISTS "enrollments_userId_courseId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_userId_startupId_courseId_key"
  ON "enrollments"("userId", "startupId", "courseId");

CREATE INDEX IF NOT EXISTS "enrollments_userId_startupId_idx"
  ON "enrollments"("userId", "startupId");

ALTER TABLE "enrollments"
  ADD CONSTRAINT "enrollments_startupId_fkey"
  FOREIGN KEY ("startupId") REFERENCES "startups"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "startupId" TEXT;

DROP INDEX IF EXISTS "certificates_userId_courseId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "certificates_userId_startupId_courseId_key"
  ON "certificates"("userId", "startupId", "courseId");

CREATE INDEX IF NOT EXISTS "certificates_userId_startupId_idx"
  ON "certificates"("userId", "startupId");

ALTER TABLE "certificates"
  ADD CONSTRAINT "certificates_startupId_fkey"
  FOREIGN KEY ("startupId") REFERENCES "startups"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
