import { db } from "@/lib/db";
import type { ResearchAgentType } from "@prisma/client";
import { runInterpreterAgent } from "./interpreter";
import { runMarketResearchAgent } from "./market-research";
import { runTrendAnalysisAgent } from "./trend-analysis";
import { runExecutionFrictionAgent } from "./execution-friction";
import { runSynthesisAgent } from "./synthesis";
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
 */
export async function runResearchPipeline(
  ideaId: string
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

  const baseInput: AgentInput = {
    ideaId,
    rawInput,
    previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
  };

  try {
    // Step 1: Interpreter
    console.log(`[Pipeline] Running InterpreterAgent for idea ${ideaId}`);
    outputs.INTERPRETER = await runInterpreterAgent(baseInput);
    await saveResearchPacket(ideaId, outputs.INTERPRETER);

    // Step 2: Market Research (depends on Interpreter)
    console.log(`[Pipeline] Running MarketResearchAgent for idea ${ideaId}`);
    outputs.MARKET_RESEARCH = await runMarketResearchAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.MARKET_RESEARCH);

    // Step 3: Trend Analysis (depends on Interpreter)
    console.log(`[Pipeline] Running TrendAnalysisAgent for idea ${ideaId}`);
    outputs.TREND_ANALYSIS = await runTrendAnalysisAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.TREND_ANALYSIS);

    // Step 4: Execution Friction (depends on Interpreter)
    console.log(`[Pipeline] Running ExecutionFrictionAgent for idea ${ideaId}`);
    outputs.EXECUTION_FRICTION = await runExecutionFrictionAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.EXECUTION_FRICTION);

    // Step 5: Synthesis (depends on all previous)
    console.log(`[Pipeline] Running SynthesisAgent for idea ${ideaId}`);
    outputs.SYNTHESIS = await runSynthesisAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.SYNTHESIS);

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
