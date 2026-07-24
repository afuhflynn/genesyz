ALTER TABLE "tasks" ADD COLUMN "experimentId" TEXT;

ALTER TABLE "growth_experiments" ALTER COLUMN "status" SET DEFAULT 'PLANNED';

CREATE INDEX "tasks_experimentId_idx" ON "tasks"("experimentId");

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_experimentId_fkey"
FOREIGN KEY ("experimentId") REFERENCES "growth_experiments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
