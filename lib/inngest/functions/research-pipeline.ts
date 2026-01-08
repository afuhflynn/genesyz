import { inngest } from "../client";
import { runResearchPipeline } from "@/lib/agents/pipeline";
import { db } from "@/lib/db";
import { sendResearchCompleteEmail } from "@/lib/email/send";

/**
 * Research Pipeline Function
 * Triggered when a new idea is submitted
 * Runs the multi-agent AI research pipeline
 */
export const researchPipelineFunction = inngest.createFunction(
  {
    id: "research-pipeline",
    name: "AI Research Pipeline",
    retries: 3,
    concurrency: {
      limit: 5, // Limit concurrent research jobs
    },
  },
  { event: "idea.submitted" },
  async ({ event, step }) => {
    const { ideaId, userId } = event.data;

    // Step 1: Create research job record
    const job = await step.run("create-research-job", async () => {
      return await db.researchJob.create({
        data: {
          ideaId,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });
    });

    // Step 2: Update idea status to processing
    await step.run("update-idea-status", async () => {
      await db.idea.update({
        where: { id: ideaId },
        data: { status: "PROCESSING" },
      });
    });

    // Step 3: Run the research pipeline
    const result = await step.run("run-research-pipeline", async () => {
      return await runResearchPipeline(ideaId);
    });

    // Step 4: Update research job status
    await step.run("complete-research-job", async () => {
      await db.researchJob.update({
        where: { id: job.id },
        data: {
          status: result.success ? "COMPLETED" : "FAILED",
          completedAt: new Date(),
          error: result.error,
        },
      });
    });

    // Step 5: Create audit log
    await step.run("create-audit-log", async () => {
      await db.auditLog.create({
        data: {
          userId,
          action: "research.completed",
          resource: "idea",
          resourceId: ideaId,
          metadata: {
            success: result.success,
            overallScore: result.synthesis?.scores?.overall?.score,
            verdict: result.synthesis?.verdict,
          },
        },
      });
    });

    // Step 6: Send email notification
    if (result.success && result.synthesis) {
      await step.run("send-email-notification", async () => {
        const user = await db.user.findUnique({ where: { id: userId } });
        const idea = await db.idea.findUnique({ where: { id: ideaId } });

        if (user?.email && idea) {
          await sendResearchCompleteEmail({
            to: user.email,
            userName: user.name || "Founder",
            ideaTitle: idea.title || "Untitled Idea",
            ideaId: idea.id,
            overallScore: result.synthesis.scores.overall.score,
            verdict: result.synthesis.verdict,
          });
        }
      });
    }

    // Step 7: Send completion event for other listeners
    if (result.success) {
      await step.sendEvent("send-completion-event", {
        name: "idea.research.completed",
        data: {
          ideaId,
          userId,
          overallScore: result.synthesis.scores.overall.score,
        },
      });
    }

    return {
      success: result.success,
      ideaId,
      overallScore: result.synthesis?.scores?.overall?.score,
    };
  }
);
