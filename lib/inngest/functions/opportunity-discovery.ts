import { db } from "@/lib/db";
import {
  dedupeOpportunities,
  isTrackableOpportunity,
} from "@/lib/opportunities/discovery";
import { generateStartupOpportunities } from "@/lib/opportunities/generator";
import { inngest } from "../client";

const MAX_GENERATED_PER_STARTUP = 10;

export const opportunityDiscoveryCron = inngest.createFunction(
  {
    id: "startup-opportunity-discovery-daily",
    name: "Startup Opportunity Discovery (Daily 06:00 UTC)",
    triggers: { cron: "0 6 * * *" },
  },
  async ({ step }) => {
    const startups = await step.run("fetch-active-startups", async () => {
      return db.startup.findMany({
        where: { isActive: true },
        select: {
          id: true,
          userId: true,
          name: true,
          industry: true,
          stage: true,
          targetMarket: true,
          description: true,
          idea: {
            select: {
              summary: true,
            },
          },
        },
      });
    });

    const summary = {
      startupsScanned: startups.length,
      startupsWithInsertions: 0,
      generatedCandidates: 0,
      filteredIneligible: 0,
      insertedOpportunities: 0,
      dedupedOpportunities: 0,
      failedStartups: 0,
      failures: [] as Array<{ startupId: string; error: string }>,
    };

    for (const startup of startups) {
      try {
        const existing = await step.run(
          `load-existing-opportunities-${startup.id}`,
          async () => {
            return db.startupOpportunity.findMany({
              where: { startupId: startup.id },
              select: { title: true, url: true },
            });
          },
        );

        const { opportunities } = await step.run(
          `generate-opportunities-${startup.id}`,
          async () => {
            return generateStartupOpportunities(
              {
                startupName: startup.name,
                industry: startup.industry,
                stage: startup.stage,
                targetMarket: startup.targetMarket,
                description: startup.description,
                ideaSummary: startup.idea?.summary,
              },
              { maxResults: MAX_GENERATED_PER_STARTUP },
            );
          },
        );

        summary.generatedCandidates += opportunities.length;

        const eligibleOpportunities = opportunities.filter((opportunity) =>
          isTrackableOpportunity(opportunity),
        );

        summary.filteredIneligible +=
          opportunities.length - eligibleOpportunities.length;

        const deduped = dedupeOpportunities(
          existing,
          eligibleOpportunities,
        ).slice(
          0,
          MAX_GENERATED_PER_STARTUP,
        );

        summary.dedupedOpportunities +=
          eligibleOpportunities.length - deduped.length;

        if (deduped.length > 0) {
          await step.run(`insert-opportunities-${startup.id}`, async () => {
            await db.startupOpportunity.createMany({
              data: deduped.map((opportunity) => ({
                startupId: startup.id,
                title: opportunity.title,
                description: opportunity.description,
                url: opportunity.url || "",
                category: opportunity.category,
                eligibility: opportunity.eligibility,
                benefits: opportunity.benefits,
                deadline: opportunity.deadline,
                status: "DISCOVERED",
                source: "ai_generated",
              })),
            });
          });

          summary.insertedOpportunities += deduped.length;
          summary.startupsWithInsertions += 1;
        }
      } catch (error) {
        summary.failedStartups += 1;
        summary.failures.push({
          startupId: startup.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await step.run("log-opportunity-discovery-summary", async () => {
      await db.auditLog.create({
        data: {
          action: "startup.opportunity.discovery.daily",
          resource: "startup_opportunity",
          metadata: summary,
        },
      });
    });

    return summary;
  },
);
