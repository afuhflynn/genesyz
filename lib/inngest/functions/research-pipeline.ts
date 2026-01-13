import { channel, topic } from "@inngest/realtime";
import { v4 as uuid4 } from "uuid";
import z from "zod";
import { runResearchPipeline } from "@/lib/agents/pipeline";
import { db } from "@/lib/db";
import { sendResearchCompleteEmail } from "@/lib/email/send";
import { inngest } from "../client";

export const ideaChannel = channel((ideaId: string) => `idea:${ideaId}`)
  .addTopic(
    topic("research.started").schema(
      z.object({
        status: z.enum(["PROCESSING", "PENDING"]),
        message: z.string(),
        id: z.string(),
      }),
    ),
  )
  .addTopic(
    topic("research.progress").schema(
      z.object({
        status: z.enum(["COMPLETED", "FAILED"]),
        message: z.string(),
        result: z.object({
          success: z.boolean(),
          id: z.string(),
          outputs: z.object({
            INTERPRETER: z.object({
              content: z.object({
                problemStatement: z.string(),
                proposedSolution: z.string(),
                uniqueValue: z.string(),
              }),
              confidence: z.number(),
            }),
            MARKET_RESEARCH: z.object({
              content: z.object({
                marketSize: z.object({
                  tam: z.number(),
                  growthRate: z.number(),
                }),
                competitors: z.array(
                  z.object({
                    name: z.string(),
                    description: z.string(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                  }),
                ),
              }),
              confidence: z.number(),
            }),
            TREND_ANALYSIS: z.object({
              content: z.object({
                technologyReadiness: z.object({
                  score: z.number(),
                  explanation: z.string(),
                }),
                timingAssessment: z.object({
                  verdict: z.string(),
                  reasoning: z.string(),
                }),
              }),
              confidence: z.number(),
            }),
            EXECUTION_FRICTION: z.object({
              content: z.object({
                technicalComplexity: z.object({
                  score: z.number(),
                  explanation: z.string(),
                }),
                riskFactors: z.array(
                  z.object({
                    risk: z.string(),
                    mitigation: z.string(),
                  }),
                ),
              }),
              confidence: z.number(),
            }),
            DEEP_RESEARCH: z.object({
              content: z.object({
                marketSize: z.object({
                  tam: z.number(),
                  growthRate: z.number(),
                }),
                competitors: z.array(
                  z.object({
                    name: z.string(),
                    description: z.string(),
                    strengths: z.array(z.string()),
                    weaknesses: z.array(z.string()),
                  }),
                ),
              }),
              confidence: z.number(),
            }),
            SYNTHESIS: z.object({
              content: z.object({
                scores: z.object({
                  overall: z.object({
                    score: z.number(),
                    explanation: z.string(),
                  }),
                  clarity: z.object({
                    score: z.number(),
                    explanation: z.string(),
                  }),
                  marketReadiness: z.object({
                    score: z.number(),
                    explanation: z.string(),
                  }),
                  executionFeasibility: z.object({
                    score: z.number(),
                    explanation: z.string(),
                  }),
                }),
                recommendations: z.array(z.string()),
                verdict: z.string(),
              }),
            }),
          }),
        }),
      }),
    ),
  )
  .addTopic(
    topic("research.finished").schema(
      z
        .object({
          success: z.boolean(),
          ideaId: z.string(),
          overallScore: z.number(),
          id: z.string(),
        })
        .transform((data) => {
          return {
            success: data.success,
            ideaId: data.ideaId,
            overallScore: data.overallScore,
          };
        })
        .refine((data) => data.success, "Research failed")
        .refine((data) => data.overallScore !== null, "Research failed")
        .refine((data) => data.overallScore !== undefined, "Research failed"),
    ),
  )
  .addTopic(
    topic("parse.idea").schema(
      z.object({
        status: z.enum(["INITIATE", "COMPLETE"]),
        message: z.string(),
        id: z.string(),
      }),
    ),
  );

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
  async ({ event, step, publish }) => {
    const { ideaId, userId } = event.data;

    publish({
      channel: `idea:${ideaId}`,
      topic: "parse.idea",
      data: {
        status: "INITIATE",
        message: "AI research pipeline initiated",
        id: uuid4(),
      },
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
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.started",
      data: {
        status: "PROCESSING",
        message: "AI research pipeline started",
        id: uuid4(),
      },
    });

    // Step 3: Run the research pipeline
    const result = await step.run("run-research-pipeline", async () => {
      return await runResearchPipeline(ideaId, publish);
    });

    // Publish progress event
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
        message: result.success
          ? "AI research completed successfully"
          : "AI research failed",
        result: result.success ? result : null,
        id: uuid4(),
      },
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

    // Publish final completion event for realtime
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.finished",
      data: {
        success: result.success,
        ideaId,
        overallScore: result.synthesis?.scores?.overall?.score,
        message: "Deep Research and Analysis finished.",
        id: uuid4(),
      },
    });

    return {
      success: result.success,
      ideaId,
      overallScore: result.synthesis?.scores?.overall?.score,
    };
  },
);
