ALTER TABLE "organization_entitlements"
  ADD COLUMN IF NOT EXISTS "storageLimitBytes" BIGINT NOT NULL DEFAULT 262144000,
  ADD COLUMN IF NOT EXISTS "hostedProjectLimit" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "capabilities" JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "prototypes"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "workspace_usage_events" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "startupId" TEXT,
  "resource" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "operationKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMMITTED',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_usage_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_usage_events_operationKey_key" ON "workspace_usage_events"("operationKey");
CREATE INDEX IF NOT EXISTS "workspace_usage_events_organizationId_resource_createdAt_idx" ON "workspace_usage_events"("organizationId", "resource", "createdAt");
CREATE INDEX IF NOT EXISTS "workspace_usage_events_startupId_idx" ON "workspace_usage_events"("startupId");

CREATE TABLE IF NOT EXISTS "workspace_files" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "startupId" TEXT,
  "ideaId" TEXT,
  "objectKey" TEXT NOT NULL,
  "url" TEXT,
  "name" TEXT,
  "mimeType" TEXT,
  "byteSize" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_files_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_files_objectKey_key" ON "workspace_files"("objectKey");
CREATE INDEX IF NOT EXISTS "workspace_files_organizationId_status_idx" ON "workspace_files"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "workspace_files_startupId_idx" ON "workspace_files"("startupId");
CREATE INDEX IF NOT EXISTS "workspace_files_ideaId_idx" ON "workspace_files"("ideaId");

DO $$ BEGIN
  ALTER TABLE "workspace_usage_events" ADD CONSTRAINT "workspace_usage_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_usage_events" ADD CONSTRAINT "workspace_usage_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_usage_events" ADD CONSTRAINT "workspace_usage_events_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
