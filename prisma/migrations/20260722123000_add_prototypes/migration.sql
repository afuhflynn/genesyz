CREATE TABLE "prototypes" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prototypes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prototypes_startupId_updatedAt_idx" ON "prototypes"("startupId", "updatedAt");
ALTER TABLE "prototypes" ADD CONSTRAINT "prototypes_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
