ALTER TABLE "growth_events" ADD COLUMN "channel" TEXT;
CREATE INDEX "growth_events_startupId_channel_idx" ON "growth_events"("startupId", "channel");
