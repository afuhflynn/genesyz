import { v4 as uuid4 } from "uuid";
import {
  runInterpreterPhase,
  runParallelPhase,
  runSynthesisPhase,
} from "@/lib/agents/pipeline";
import { db } from "@/lib/db";
import { sendResearchCompleteEmail } from "@/lib/email/send";
import { ideaChannel } from "@/lib/inngest/channels";
import { inngest } from "../client";

export const researchPipelineFunction = inngest.createFunction(
  {
    id: "research-pipeline",
    name: "AI Research Pipeline",
    retries: 3,
    concurrency: {
      limit: 5,
    },
    triggers: { event: "idea.submitted" },
  },
  async ({ event, step }) => {
    const { ideaId, userId } = event.data;
    const ch = ideaChannel({ ideaId });

    await inngest.realtime.publish(ch["parse.idea"], {
      status: "INITIATE",
      message: "AI research pipeline initiated",
      id: uuid4(),
    });

    const job = await step.run("create-research-job", async () => {
      return await db.researchJob.create({
        data: {
          ideaId,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });
    });

    await step.run("update-idea-status", async () => {
      await db.idea.update({
        where: { id: ideaId },
        data: { status: "PROCESSING" },
      });
    });

    await inngest.realtime.publish(ch["research.started"], {
      status: "PROCESSING",
      message: "AI research pipeline started",
      id: uuid4(),
    });

    // Phase 1: Interpreter
    const interpreterStep = await step.run("run-interpreter", async () => {
      return await runInterpreterPhase(ideaId);
    });

    await inngest.realtime.publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Interpreted your idea",
      id: uuid4(),
    });

    // Phase 2: Parallel agents (Market, Trend, Friction, Deep)
    const parallelStep = await step.run("run-parallel-agents", async () => {
      return await runParallelPhase(ideaId, interpreterStep.output);
    });

    await inngest.realtime.publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Completed market research, trend analysis, and risk assessment",
      id: uuid4(),
    });

    // Phase 3: Synthesis
    const allOutputs = {
      INTERPRETER: interpreterStep.output,
      MARKET_RESEARCH: parallelStep.marketResearch,
      TREND_ANALYSIS: parallelStep.trendAnalysis,
      EXECUTION_FRICTION: parallelStep.executionFriction,
      DEEP_RESEARCH: parallelStep.deepResearch,
    } as unknown as Record<
      import("@prisma/client").ResearchAgentType,
      import("@/lib/agents/types").AgentOutput
    >;

    const synthesisStep = await step.run("run-synthesis", async () => {
      return await runSynthesisPhase(ideaId, allOutputs);
    });

    const result = {
      success: true,
      synthesis: synthesisStep.synthesis,
      outputs: allOutputs,
    };

    await inngest.realtime.publish(ch["research.progress"], {
      status: result.success ? "COMPLETED" : "FAILED",
      message: result.success
        ? "AI research completed successfully"
        : "AI research failed",
      id: uuid4(),
    });

    await step.run("complete-research-job", async () => {
      await db.researchJob.update({
        where: { id: job.id },
        data: {
          status: result.success ? "COMPLETED" : "FAILED",
          completedAt: new Date(),
        },
      });
    });

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

    const synthesisAny = result.synthesis as any;
    const overallScore =
      synthesisAny?.overallScore ?? synthesisAny?.scores?.overall?.score ?? 0;
    await step.realtime.publish(
      "publish-research-finished",
      ch["research.finished"],
      {
        success: result.success,
        ideaId,
        overallScore,
        message: "Deep Research and Analysis finished.",
        id: uuid4(),
      },
    );

    return {
      success: result.success,
      ideaId,
      overallScore,
    };
  },
);
