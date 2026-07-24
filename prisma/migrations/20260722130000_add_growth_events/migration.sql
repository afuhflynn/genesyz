CREATE TABLE IF NOT EXISTS "growth_events" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "campaignId" TEXT,
    "experimentId" TEXT,
    "eventName" TEXT NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "campaignName" TEXT,
    "value" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "growth_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "growth_events_startupId_occurredAt_idx" ON "growth_events"("startupId", "occurredAt");
CREATE INDEX IF NOT EXISTS "growth_events_startupId_eventName_idx" ON "growth_events"("startupId", "eventName");
CREATE INDEX IF NOT EXISTS "growth_events_campaignId_idx" ON "growth_events"("campaignId");
CREATE INDEX IF NOT EXISTS "growth_events_experimentId_idx" ON "growth_events"("experimentId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_events_startupId_fkey'
    ) THEN
        ALTER TABLE "growth_events"
        ADD CONSTRAINT "growth_events_startupId_fkey"
        FOREIGN KEY ("startupId") REFERENCES "startups"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_events_campaignId_fkey'
    ) THEN
        ALTER TABLE "growth_events"
        ADD CONSTRAINT "growth_events_campaignId_fkey"
        FOREIGN KEY ("campaignId") REFERENCES "growth_campaigns"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'growth_events_experimentId_fkey'
    ) THEN
        ALTER TABLE "growth_events"
        ADD CONSTRAINT "growth_events_experimentId_fkey"
        FOREIGN KEY ("experimentId") REFERENCES "growth_experiments"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
