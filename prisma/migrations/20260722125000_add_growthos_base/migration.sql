-- GrowthOS base tables.
--
-- These tables must exist before add_growth_events adds its foreign keys.
-- The IF NOT EXISTS guards make this safe when a database already contains
-- part of the GrowthOS schema from an earlier deployment.

CREATE TABLE IF NOT EXISTS "customer_personas" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '💡',
    "description" TEXT NOT NULL DEFAULT '',
    "painPoints" JSONB NOT NULL DEFAULT '[]',
    "channels" JSONB NOT NULL DEFAULT '[]',
    "psychographics" TEXT NOT NULL DEFAULT '',
    "score" INTEGER NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_personas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "growth_campaigns" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "growth_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "growth_experiments" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "results" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "conclusion" TEXT NOT NULL DEFAULT 'PENDING',
    "learnings" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "growth_experiments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "customer_personas_startupId_idx"
ON "customer_personas"("startupId");

CREATE INDEX IF NOT EXISTS "growth_campaigns_startupId_idx"
ON "growth_campaigns"("startupId");

CREATE INDEX IF NOT EXISTS "growth_experiments_startupId_idx"
ON "growth_experiments"("startupId");

CREATE INDEX IF NOT EXISTS "growth_experiments_campaignId_idx"
ON "growth_experiments"("campaignId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customer_personas_startupId_fkey'
    ) THEN
        ALTER TABLE "customer_personas"
        ADD CONSTRAINT "customer_personas_startupId_fkey"
        FOREIGN KEY ("startupId") REFERENCES "startups"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_campaigns_startupId_fkey'
    ) THEN
        ALTER TABLE "growth_campaigns"
        ADD CONSTRAINT "growth_campaigns_startupId_fkey"
        FOREIGN KEY ("startupId") REFERENCES "startups"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_experiments_startupId_fkey'
    ) THEN
        ALTER TABLE "growth_experiments"
        ADD CONSTRAINT "growth_experiments_startupId_fkey"
        FOREIGN KEY ("startupId") REFERENCES "startups"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_experiments_campaignId_fkey'
    ) THEN
        ALTER TABLE "growth_experiments"
        ADD CONSTRAINT "growth_experiments_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "growth_campaigns"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
