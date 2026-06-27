import { v4 as uuid4 } from "uuid";
import { runResearchPipeline } from "@/lib/agents/pipeline";
import { db } from "@/lib/db";
import { sendResearchCompleteEmail } from "@/lib/email/send";
import { inngest } from "../client";
import { ideaChannel } from "@/lib/inngest/channels";

/**
 * Research Pipeline Function
 * Triggered when a new idea is submitted
 * Runs multi-agent AI research pipeline with dual-model architecture
 *
 * **AI Model Strategy**:
 * - Primary Model: Mistral `open-mixtral-8x7b` (cost-effective for high-volume)
 * - Fallback Model: Google Gemini 2.5 Flash (automatic failover on API errors)
 * - Each agent uses try-catch pattern to switch models
 * - Model usage is tracked in `researchLog.model` field for monitoring
 *
 * **Agent Pipeline**:
 * 1. Interpreter Agent (understands idea from vague inputs)
 * 2. Market Research Agent (analyzes TAM, competitors, growth rates)
 * 3. Trend Analysis Agent (checks timing and technology readiness)
 * 4. Execution Friction Agent (identifies technical and operational risks)
 * 5. Deep Research Agent (uses web search for market validation)
 * 6. Synthesis Agent (combines all data into final score and verdict)
 */
export const researchPipelineFunction = inngest.createFunction(
  {
    id: "research-pipeline",
    name: "AI Research Pipeline",
    retries: 3,
    concurrency: {
      limit: 5, // Limit concurrent research jobs
    },
    triggers: { event: "idea.submitted" },
  },
  async ({ event, step }) => {
    const { ideaId, userId } = event.data;
    const ch = ideaChannel({ ideaId });

    const publish = (topicRef: any, data: any) =>
      step.realtime.publish(uuid4(), topicRef, data);

    publish(ch["parse.idea"], {
      status: "INITIATE",
      message: "AI research pipeline initiated",
      id: uuid4(),
    });
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

    // Publish start event
    publish(ch["research.started"], {
      status: "PROCESSING",
      message: "AI research pipeline started",
      id: uuid4(),
    });

    // Step 3: Run the research pipeline
    const result = await step.run("run-research-pipeline", async () => {
      return await runResearchPipeline(ideaId, publish);
    });

    // Publish progress event
    publish(ch["research.progress"], {
      status: result.success ? "COMPLETED" : "FAILED",
      message: result.success
        ? "AI research completed successfully"
        : "AI research failed",
      id: uuid4(),
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
      const synthesisAny = result.synthesis as any;
      const overallScore =
        synthesisAny?.overallScore ?? synthesisAny?.scores?.overall?.score ?? 0;
      const verdict = synthesisAny?.verdict;

      await db.auditLog.create({
        data: {
          userId,
          action: "research.completed",
          resource: "idea",
          resourceId: ideaId,
          metadata: {
            success: result.success,
            overallScore,
            verdict,
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
          const synthesisAny = result.synthesis as any;
          await sendResearchCompleteEmail({
            to: user.email,
            userName: user.name || "Founder",
            ideaTitle: idea.title || "Untitled Idea",
            ideaId: idea.id,
            overallScore:
              synthesisAny.overallScore ??
              synthesisAny.scores?.overall?.score ??
              0,
            verdict: synthesisAny.verdict,
          });
        }
      });
    }

    // Step 7: Create Research Feed Item if Startup exists
    if (result.success && result.synthesis) {
      await step.run("create-research-feed-item", async () => {
        const startup = await db.startup.findUnique({
          where: { ideaId },
        });

        if (startup) {
          const synthesisAny = result.synthesis as any;
          const overallScore =
            synthesisAny.overallScore ??
            synthesisAny.scores?.overall?.score ??
            0;
          const overallExplanation =
            synthesisAny.overallExplanation ??
            synthesisAny.scores?.overall?.explanation ??
            "";
          const verdict = synthesisAny.verdict;

          const idempotencyKey = `idea-research-${ideaId}-${startup.id}`;
          await db.researchFeedItem.upsert({
            where: { idempotencyKey },
            create: {
              startupId: startup.id,
              ideaId,
              type: "IDEA_RESEARCH",
              title: `Initial Research: ${startup.name}`,
              summary: overallExplanation,
              idempotencyKey,
              content: {
                overallScore,
                verdict,
              },
            },
            update: {
              summary: overallExplanation,
              content: {
                overallScore,
                verdict,
              },
            },
          });
        }
      });
    }

    // Step 8: Send completion event for other listeners
    if (result.success) {
      const synthesisAny = result.synthesis as any;
      const overallScore =
        synthesisAny.overallScore ?? synthesisAny.scores?.overall?.score ?? 0;
      await step.sendEvent("send-completion-event", {
        name: "idea.research.completed",
        data: {
          ideaId,
          userId,
          overallScore,
        },
      });
    }

    // Publish final completion event for realtime
    const synthesisAny = result.synthesis as any;
    const overallScore =
      synthesisAny?.overallScore ?? synthesisAny?.scores?.overall?.score ?? 0;
    publish(ch["research.finished"], {
      success: result.success,
      ideaId,
      overallScore,
      message: "Deep Research and Analysis finished.",
      id: uuid4(),
    });

    return {
      success: result.success,
      ideaId,
      overallScore,
    };
  },
);
