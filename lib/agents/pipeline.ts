import type { Realtime } from "inngest";
import type { ResearchAgentType } from "@prisma/client";
import { v4 as uuid4 } from "uuid";
import { db } from "@/lib/db";
import { runDeepResearchAgent } from "./deep-research";
import { runExecutionFrictionAgent } from "./execution-friction";
import { runInterpreterAgent } from "./interpreter";
import { runMarketResearchAgent } from "./market-research";
import { runSynthesisAgent } from "./synthesis";
import { runTrendAnalysisAgent } from "./trend-analysis";
import { ideaChannel } from "@/lib/inngest/channels";
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
 * - Model: Google Gemini 3.5 Flash (single model with text-only fallback)
 * - If schema generation fails, falls back to generateText + JSON parsing
 * - Each agent logs the model used via `researchLog.model` field
 *
 * **Agent Pipeline**:
 * 1. Interpreter Agent (structures vague input into title/summary/problem/solution)
 * 2. Market Research Agent (analyzes TAM/SAM/SOM, competitors, growth rates, barriers)
 * 3. Trend Analysis Agent (timing verdict, technology readiness score)
 * 4. Execution Friction Agent (technical complexity, resource estimates, risk factors)
 * 5. Deep Research Agent (web search via Tavily for market gaps and validation)
 * 6. Synthesis Agent (combines all data into final score and verdict)
 */
export async function runResearchPipeline(
  ideaId: string,
  publish: Realtime.TypedPublishFn,
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
  const textInput = idea.inputs.find((i) => i.type === "TEXT")?.content;
  const rawInput: IdeaInputData = {
    text: idea.originalPrompt || textInput || undefined,
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
    const ch = ideaChannel({ ideaId });

    // Step 1: Interpreter
    const interpreterStepId = uuid4();
    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Interpreting your idea",
      id: interpreterStepId,
    });

    console.log(`[Pipeline] Running InterpreterAgent for idea ${ideaId}`);
    outputs.INTERPRETER = await runInterpreterAgent(baseInput);
    await saveResearchPacket(ideaId, outputs.INTERPRETER);

    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Interpreted your idea",
      id: interpreterStepId,
    });

    // Steps 2-5: Run in parallel (all depend only on Interpreter)
    const marketRsearchStepId = uuid4();
    const trendAnalysisStepId = uuid4();
    const executionFrictionStepId = uuid4();
    const deepResearchStepId = uuid4();

    const previousOnlyInterpreter = outputs as Record<
      ResearchAgentType,
      AgentOutput
    >;

    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Researching market size, competitors, and trends",
      id: marketRsearchStepId,
    });
    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Analyzing trends and risks",
      id: trendAnalysisStepId,
    });
    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Assessing execution risks",
      id: executionFrictionStepId,
    });
    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Analyzing deep research",
      id: deepResearchStepId,
    });

    console.log(
      `[Pipeline] Running MarketResearch, TrendAnalysis, ExecutionFriction, DeepResearch in parallel for idea ${ideaId}`,
    );

    const [marketResult, trendResult, frictionResult, deepResult] =
      await Promise.all([
        runMarketResearchAgent({
          ...baseInput,
          previousOutputs: previousOnlyInterpreter,
        }),
        runTrendAnalysisAgent({
          ...baseInput,
          previousOutputs: previousOnlyInterpreter,
        }),
        runExecutionFrictionAgent({
          ...baseInput,
          previousOutputs: previousOnlyInterpreter,
        }),
        runDeepResearchAgent({
          ...baseInput,
          previousOutputs: previousOnlyInterpreter,
        }),
      ]);

    outputs.MARKET_RESEARCH = marketResult;
    outputs.TREND_ANALYSIS = trendResult;
    outputs.EXECUTION_FRICTION = frictionResult;
    outputs.DEEP_RESEARCH = deepResult;

    await Promise.all([
      saveResearchPacket(ideaId, marketResult),
      saveResearchPacket(ideaId, trendResult),
      saveResearchPacket(ideaId, frictionResult),
      saveResearchPacket(ideaId, deepResult),
    ]);

    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Researched market size, competitors, and trends",
      id: marketRsearchStepId,
    });
    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Analyzed trends and risks",
      id: trendAnalysisStepId,
    });
    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Assessed execution risks",
      id: executionFrictionStepId,
    });
    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Analyzed deep research",
      id: deepResearchStepId,
    });

    // Step 6: Synthesis (depends on all previous)
    const synthesisStepId = uuid4();
    publish(ch["research.progress"], {
      status: "RUNNING",
      message: "Synthesizing your idea",
      id: synthesisStepId,
    });
    console.log(`[Pipeline] Running SynthesisAgent for idea ${ideaId}`);
    outputs.SYNTHESIS = await runSynthesisAgent({
      ...baseInput,
      previousOutputs: outputs as Record<ResearchAgentType, AgentOutput>,
    });
    await saveResearchPacket(ideaId, outputs.SYNTHESIS);
    publish(ch["research.progress"], {
      status: "COMPLETED",
      message: "Synthesized your idea",
      id: synthesisStepId,
    });

    // Save scores - handle both old (nested) and new (flat) schema formats
    const synthesis = outputs.SYNTHESIS.content as any;
    await db.ideaScore.create({
      data: {
        ideaId,
        clarityScore:
          synthesis.clarityScore ?? synthesis.scores?.clarity?.score ?? 0,
        clarityExplanation:
          synthesis.clarityExplanation ??
          synthesis.scores?.clarity?.explanation ??
          "",
        marketScore:
          synthesis.marketScore ??
          synthesis.scores?.marketReadiness?.score ??
          0,
        marketExplanation:
          synthesis.marketExplanation ??
          synthesis.scores?.marketReadiness?.explanation ??
          "",
        executionScore:
          synthesis.executionScore ??
          synthesis.scores?.executionFeasibility?.score ??
          0,
        executionExplanation:
          synthesis.executionExplanation ??
          synthesis.scores?.executionFeasibility?.explanation ??
          "",
        overallScore:
          synthesis.overallScore ?? synthesis.scores?.overall?.score ?? 0,
        overallExplanation:
          synthesis.overallExplanation ??
          synthesis.scores?.overall?.explanation ??
          "",
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
        title: interpretedIdea?.title || "Untitled",
        summary: interpretedIdea?.summary || "",
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
