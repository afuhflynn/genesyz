-- Organization-owned subscription entitlements and startup allocations.
CREATE TYPE "WorkspacePlan" AS ENUM ('EXPLORER', 'FOUNDER', 'TEAM', 'GROWTH', 'ACCELERATOR', 'ENTERPRISE');

CREATE TABLE "organization_entitlements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "polarCustomerId" TEXT,
    "polarSubscriptionId" TEXT,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'EXPLORER',
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "maxStartups" INTEGER NOT NULL DEFAULT 1,
    "aiCredits" INTEGER NOT NULL DEFAULT 100,
    "builderCredits" INTEGER NOT NULL DEFAULT 0,
    "hostingCredits" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "startup_entitlements" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'FOUNDER',
    "inherited" BOOLEAN NOT NULL DEFAULT true,
    "aiCredits" INTEGER NOT NULL DEFAULT 25,
    "builderCredits" INTEGER NOT NULL DEFAULT 0,
    "hostingCredits" INTEGER NOT NULL DEFAULT 0,
    "featureOverrides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_entitlements_organizationId_key" ON "organization_entitlements"("organizationId");
CREATE INDEX "organization_entitlements_polarCustomerId_idx" ON "organization_entitlements"("polarCustomerId");
CREATE INDEX "organization_entitlements_polarSubscriptionId_idx" ON "organization_entitlements"("polarSubscriptionId");
CREATE UNIQUE INDEX "startup_entitlements_startupId_key" ON "startup_entitlements"("startupId");

ALTER TABLE "organization_entitlements" ADD CONSTRAINT "organization_entitlements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "startup_entitlements" ADD CONSTRAINT "startup_entitlements_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
