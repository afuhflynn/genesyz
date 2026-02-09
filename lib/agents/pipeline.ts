import type { Realtime } from "@inngest/realtime";
import type { ResearchAgentType } from "@prisma/client";
import { v4 as uuid4 } from "uuid";
import { db } from "@/lib/db";
import { runDeepResearchAgent } from "./deep-research";
import { runExecutionFrictionAgent } from "./execution-friction";
import { runInterpreterAgent } from "./interpreter";
import { runMarketResearchAgent } from "./market-research";
import { runSynthesisAgent } from "./synthesis";
import { runTrendAnalysisAgent } from "./trend-analysis";
import type {
  AgentInput,
  AgentOutput,
  IdeaInputData,
  Synthesis,
} from "./types";

export interface PipelineResult {
  success: boolean;
  outputs: Record<ResearchAgentType, AgentOutput>;
  synthesis: Synthesis;
  error?: string;
}

/**
 * Run the complete research pipeline for an idea
 * This is called by Inngest for background processing
 *
 * @param ideaId - The ID of the idea to research
 * @param publish - Inngest publish function for realtime updates
 * @returns Pipeline result with all agent outputs and synthesis
 *
 * **AI Model Architecture**:
 * - Primary Model: Mistral `open-mixtral-8x7b` (cost-effective for high-volume)
 * - Fallback Model: Google Gemini 2.5 Flash (automatic failover on errors)
 * - Each agent logs which model was used via `researchLog.model` field
 *
 * **Agent Pipeline**:
 * 1. Interpreter Agent (understands idea from vague inputs)
 * 2. Market Research Agent (analyzes TAM, competitors, growth rates)
 * 3. Trend Analysis Agent (checks timing and technology readiness)
 * 4. Execution Friction Agent (identifies technical and operational risks)
 * 5. Deep Research Agent (uses web search for market validation)
 * 6. Synthesis Agent (combines all data into final score and verdict)
 */
export async function runResearchPipeline(
  ideaId: string,
  publish: Realtime.PublishFn,
): Promise<PipelineResult> {
  // Fetch the idea and its inputs
  const idea = await db.idea.findUnique({
    where: { id: ideaId },
    include: { inputs: true },
  });

  if (!idea) {
    throw new Error(`Idea not found: ${ideaId}`);
  }

  // Combine all inputs into a single object
  const rawInput: IdeaInputData = {
    text: idea.inputs.find((i) => i.type === "TEXT")?.content || undefined,
    transcription:
      idea.inputs.find((i) => i.type === "AUDIO")?.transcription || undefined,
    ocrText: idea.inputs.find((i) => i.type === "IMAGE")?.ocrText || undefined,
  };

  const outputs: Partial<Record<ResearchAgentType, AgentOutput>> = {};

  // Parse location context if available
  const locationContext = idea.locationContext as {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    timezone?: string;
    currency?: string;
    isGlobal?: boolean;
  } | null;

  const baseInput: AgentInput = {
    ideaId,
    rawInput,
    previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    locationContext: locationContext || undefined,
  };

  try {
    // Step 1: Interpreter
    const interpreterStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Interpreting your idea",
        id: interpreterStepId,
      },
    });

    console.log(`[Pipeline] Running InterpreterAgent for idea ${ideaId}`);
    outputs.INTERPRETER = await runInterpreterAgent(baseInput);
    await saveResearchPacket(ideaId, outputs.INTERPRETER);

    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Interpreted your idea",
        id: interpreterStepId,
      },
    });

    // Step 2: Market Research (depends on Interpreter)
    const marketRsearchStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Researching market size, competitors, and trends",
        id: marketRsearchStepId,
      },
    });
    console.log(`[Pipeline] Running MarketResearchAgent for idea ${ideaId}`);
    outputs.MARKET_RESEARCH = await runMarketResearchAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.MARKET_RESEARCH);
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Researched market size, competitors, and trends",
        marketRsearchStepId,
      },
    });

    // Step 3: Trend Analysis (depends on Interpreter)
    const trendAnalysisStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Analyzing trends and risks",
        id: trendAnalysisStepId,
      },
    });
    console.log(`[Pipeline] Running TrendAnalysisAgent for idea ${ideaId}`);
    outputs.TREND_ANALYSIS = await runTrendAnalysisAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.TREND_ANALYSIS);
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Analyzed trends and risks",
        id: trendAnalysisStepId,
      },
    });

    // Step 4: Execution Friction (depends on Interpreter)
    const executionFrictionStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Assessing execution risks",
        id: executionFrictionStepId,
      },
    });
    console.log(`[Pipeline] Running ExecutionFrictionAgent for idea ${ideaId}`);
    outputs.EXECUTION_FRICTION = await runExecutionFrictionAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.EXECUTION_FRICTION);
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Assessed execution risks",
        id: executionFrictionStepId,
      },
    });

    // Step 5: Deep Research (depends on Interpreter)
    const deepResearchStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Analyzing deep research",
        id: deepResearchStepId,
      },
    });
    console.log(`[Pipeline] Running DeepResearchAgent for idea ${ideaId}`);
    const deepResearchOutput = await runDeepResearchAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    outputs.DEEP_RESEARCH = deepResearchOutput;
    await saveResearchPacket(ideaId, deepResearchOutput);
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Analyzed deep research",
        id: deepResearchStepId,
      },
    });

    // Step 6: Synthesis (depends on all previous)
    const synthesisStepId = uuid4();
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "RUNNING",
        message: "Synthesizing your idea",
        id: synthesisStepId,
      },
    });
    console.log(`[Pipeline] Running SynthesisAgent for idea ${ideaId}`);
    outputs.SYNTHESIS = await runSynthesisAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.SYNTHESIS);
    publish({
      channel: `idea:${ideaId}`,
      topic: "research.progress",
      data: {
        status: "COMPLETED",
        message: "Synthesized your idea",
        id: synthesisStepId,
      },
    });

    // Save scores
    const synthesis = outputs.SYNTHESIS.content as Synthesis;
    await db.ideaScore.create({
      data: {
        ideaId,
        clarityScore: synthesis.scores.clarity.score,
        clarityExplanation: synthesis.scores.clarity.explanation,
        marketScore: synthesis.scores.marketReadiness.score,
        marketExplanation: synthesis.scores.marketReadiness.explanation,
        executionScore: synthesis.scores.executionFeasibility.score,
        executionExplanation: synthesis.scores.executionFeasibility.explanation,
        overallScore: synthesis.scores.overall.score,
        overallExplanation: synthesis.scores.overall.explanation,
      },
    });

    // Update idea with title and summary
    const interpretedIdea = outputs.INTERPRETER.content as {
      title: string;
      summary: string;
    };
    await db.idea.update({
      where: { id: ideaId },
      data: {
        title: interpretedIdea.title,
        summary: interpretedIdea.summary,
        status: "RESEARCHED",
        researchedAt: new Date(),
      },
    });

    console.log(`[Pipeline] Completed research for idea ${ideaId}`);

    return {
      success: true,
      outputs: outputs as Record<ResearchAgentType, AgentOutput>,
      synthesis,
    };
  } catch (error) {
    console.error(`[Pipeline] Error researching idea ${ideaId}:`, error);

    // Update idea status to failed
    await db.idea.update({
      where: { id: ideaId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

async function saveResearchPacket(ideaId: string, output: AgentOutput) {
  await db.researchPacket.create({
    data: {
      ideaId,
      agentType: output.agentType,
      content: output.content as object,
      confidence: output.confidence,
    },
  });
}
