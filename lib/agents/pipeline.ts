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

async function fetchIdea(ideaId: string) {
  return await db.idea.findUnique({
    where: { id: ideaId },
    include: { inputs: true },
  });
}

function buildBaseInput(
  idea: NonNullable<Awaited<ReturnType<typeof fetchIdea>>>,
  previousOutputs: Record<ResearchAgentType, AgentOutput>,
): AgentInput {
  const textInput = idea.inputs.find((i) => i.type === "TEXT")?.content;
  const rawInput: IdeaInputData = {
    text: idea.originalPrompt || textInput || undefined,
    transcription:
      idea.inputs.find((i) => i.type === "AUDIO")?.transcription || undefined,
    ocrText: idea.inputs.find((i) => i.type === "IMAGE")?.ocrText || undefined,
  };
  const locationContext = idea.locationContext as {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    timezone?: string;
    currency?: string;
    isGlobal?: boolean;
  } | null;
  return {
    ideaId: idea.id,
    rawInput,
    previousOutputs,
    locationContext: locationContext || undefined,
  };
}

export async function runInterpreterPhase(
  ideaId: string,
): Promise<{ output: AgentOutput }> {
  const idea = await fetchIdea(ideaId);
  if (!idea) throw new Error(`Idea not found: ${ideaId}`);

  const baseInput = buildBaseInput(
    idea,
    {} as Record<ResearchAgentType, AgentOutput>,
  );

  console.log(`[Pipeline] Running InterpreterAgent for idea ${ideaId}`);
  const output = await runInterpreterAgent(baseInput);
  await saveResearchPacket(ideaId, output);

  return { output };
}

export async function runParallelPhase(
  ideaId: string,
  interpreterOutput: AgentOutput,
): Promise<{
  marketResearch: AgentOutput;
  trendAnalysis: AgentOutput;
  executionFriction: AgentOutput;
  deepResearch: AgentOutput;
}> {
  const idea = await fetchIdea(ideaId);
  if (!idea) throw new Error(`Idea not found: ${ideaId}`);

  const previousOutputs = {
    INTERPRETER: interpreterOutput,
  } as Record<ResearchAgentType, AgentOutput>;
  const baseInput = buildBaseInput(idea, previousOutputs);

  console.log(
    `[Pipeline] Running MarketResearch, TrendAnalysis, ExecutionFriction, DeepResearch in parallel for idea ${ideaId}`,
  );

  const [marketResearch, trendAnalysis, executionFriction, deepResearch] =
    await Promise.all([
      runMarketResearchAgent(baseInput),
      runTrendAnalysisAgent(baseInput),
      runExecutionFrictionAgent(baseInput),
      runDeepResearchAgent(baseInput),
    ]);

  await Promise.all([
    saveResearchPacket(ideaId, marketResearch),
    saveResearchPacket(ideaId, trendAnalysis),
    saveResearchPacket(ideaId, executionFriction),
    saveResearchPacket(ideaId, deepResearch),
  ]);

  return { marketResearch, trendAnalysis, executionFriction, deepResearch };
}

export async function runSynthesisPhase(
  ideaId: string,
  allOutputs: Record<ResearchAgentType, AgentOutput>,
): Promise<{ synthesis: Synthesis }> {
  const idea = await fetchIdea(ideaId);
  if (!idea) throw new Error(`Idea not found: ${ideaId}`);

  const baseInput = buildBaseInput(idea, allOutputs);

  console.log(`[Pipeline] Running SynthesisAgent for idea ${ideaId}`);
  const output = await runSynthesisAgent(baseInput);
  await saveResearchPacket(ideaId, output);

  const synthesis = output.content as any;

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

  const interpretedIdea = allOutputs.INTERPRETER.content as {
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

  return { synthesis: synthesis as Synthesis };
}

export async function runResearchPipeline(
  ideaId: string,
  publish: Realtime.TypedPublishFn,
): Promise<PipelineResult> {
  const ch = ideaChannel({ ideaId });

  const interpreterStepId = uuid4();
  publish(ch["research.progress"], {
    status: "RUNNING",
    message: "Interpreting your idea",
    id: interpreterStepId,
  });

  const { output: interpreterOutput } = await runInterpreterPhase(ideaId);

  publish(ch["research.progress"], {
    status: "COMPLETED",
    message: "Interpreted your idea",
    id: interpreterStepId,
  });

  const marketRsearchStepId = uuid4();
  const trendAnalysisStepId = uuid4();
  const executionFrictionStepId = uuid4();
  const deepResearchStepId = uuid4();

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

  const { marketResearch, trendAnalysis, executionFriction, deepResearch } =
    await runParallelPhase(ideaId, interpreterOutput);

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

  const synthesisStepId = uuid4();
  publish(ch["research.progress"], {
    status: "RUNNING",
    message: "Synthesizing your idea",
    id: synthesisStepId,
  });

  const allOutputs = {
    INTERPRETER: interpreterOutput,
    MARKET_RESEARCH: marketResearch,
    TREND_ANALYSIS: trendAnalysis,
    EXECUTION_FRICTION: executionFriction,
    DEEP_RESEARCH: deepResearch,
  } as Record<ResearchAgentType, AgentOutput>;

  const { synthesis } = await runSynthesisPhase(ideaId, allOutputs);

  publish(ch["research.progress"], {
    status: "COMPLETED",
    message: "Synthesized your idea",
    id: synthesisStepId,
  });

  console.log(`[Pipeline] Completed research for idea ${ideaId}`);

  return {
    success: true,
    outputs: allOutputs,
    synthesis,
  };
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
