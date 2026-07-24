CREATE TABLE IF NOT EXISTS "hosted_projects" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "prototypeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'static',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "activeReleaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hosted_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hosted_releases" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "prototypeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'static',
    "status" TEXT NOT NULL DEFAULT 'VALIDATED',
    "html" TEXT NOT NULL,
    "manifest" JSONB,
    "error" TEXT,
    "promotedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hosted_releases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hosted_release_events" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hosted_release_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hosted_routes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hosted_routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hosted_projects_prototypeId_key" ON "hosted_projects"("prototypeId");
CREATE UNIQUE INDEX IF NOT EXISTS "hosted_projects_slug_key" ON "hosted_projects"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "hosted_projects_activeReleaseId_key" ON "hosted_projects"("activeReleaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "hosted_releases_projectId_version_key" ON "hosted_releases"("projectId", "version");
CREATE UNIQUE INDEX IF NOT EXISTS "hosted_routes_projectId_key" ON "hosted_routes"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "hosted_routes_slug_key" ON "hosted_routes"("slug");

CREATE INDEX IF NOT EXISTS "hosted_projects_organizationId_status_idx" ON "hosted_projects"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "hosted_projects_startupId_idx" ON "hosted_projects"("startupId");
CREATE INDEX IF NOT EXISTS "hosted_releases_projectId_status_idx" ON "hosted_releases"("projectId", "status");
CREATE INDEX IF NOT EXISTS "hosted_release_events_releaseId_createdAt_idx" ON "hosted_release_events"("releaseId", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_projects_organizationId_fkey') THEN
        ALTER TABLE "hosted_projects" ADD CONSTRAINT "hosted_projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_projects_startupId_fkey') THEN
        ALTER TABLE "hosted_projects" ADD CONSTRAINT "hosted_projects_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_projects_prototypeId_fkey') THEN
        ALTER TABLE "hosted_projects" ADD CONSTRAINT "hosted_projects_prototypeId_fkey" FOREIGN KEY ("prototypeId") REFERENCES "prototypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_releases_projectId_fkey') THEN
        ALTER TABLE "hosted_releases" ADD CONSTRAINT "hosted_releases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "hosted_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_releases_prototypeId_fkey') THEN
        ALTER TABLE "hosted_releases" ADD CONSTRAINT "hosted_releases_prototypeId_fkey" FOREIGN KEY ("prototypeId") REFERENCES "prototypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_release_events_releaseId_fkey') THEN
        ALTER TABLE "hosted_release_events" ADD CONSTRAINT "hosted_release_events_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "hosted_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_routes_projectId_fkey') THEN
        ALTER TABLE "hosted_routes" ADD CONSTRAINT "hosted_routes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "hosted_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hosted_projects_activeReleaseId_fkey') THEN
        ALTER TABLE "hosted_projects" ADD CONSTRAINT "hosted_projects_activeReleaseId_fkey" FOREIGN KEY ("activeReleaseId") REFERENCES "hosted_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
