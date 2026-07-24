ALTER TABLE "growth_campaigns" ADD COLUMN IF NOT EXISTS "objective" TEXT NOT NULL DEFAULT '';
ALTER TABLE "growth_campaigns" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "growth_campaigns" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "growth_campaigns" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "growth_campaigns" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "growth_events" ADD COLUMN "personaId" TEXT;
ALTER TABLE "growth_events" ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'AWARENESS';
ALTER TABLE "growth_events" ADD COLUMN "count" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "growth_events" ADD COLUMN "periodStart" TIMESTAMP(3);
ALTER TABLE "growth_events" ADD COLUMN "periodEnd" TIMESTAMP(3);
ALTER TABLE "growth_events" ADD COLUMN "notes" TEXT;

CREATE TABLE "growth_campaign_personas" (
  "campaignId" TEXT NOT NULL,
  "personaId" TEXT NOT NULL,
  CONSTRAINT "growth_campaign_personas_pkey" PRIMARY KEY ("campaignId", "personaId")
);
CREATE INDEX "growth_campaign_personas_personaId_idx" ON "growth_campaign_personas"("personaId");
ALTER TABLE "growth_campaign_personas" ADD CONSTRAINT "growth_campaign_personas_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "growth_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "growth_campaign_personas" ADD CONSTRAINT "growth_campaign_personas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "customer_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "growth_experiment_personas" (
  "experimentId" TEXT NOT NULL,
  "personaId" TEXT NOT NULL,
  CONSTRAINT "growth_experiment_personas_pkey" PRIMARY KEY ("experimentId", "personaId")
);
CREATE INDEX "growth_experiment_personas_personaId_idx" ON "growth_experiment_personas"("personaId");
ALTER TABLE "growth_experiment_personas" ADD CONSTRAINT "growth_experiment_personas_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "growth_experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "growth_experiment_personas" ADD CONSTRAINT "growth_experiment_personas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "customer_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "growth_events" ADD CONSTRAINT "growth_events_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "customer_personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "growth_events_personaId_idx" ON "growth_events"("personaId");
CREATE INDEX "growth_events_startupId_stage_idx" ON "growth_events"("startupId", "stage");
