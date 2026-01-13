import type { ResearchAgentType } from "@prisma/client";
import { z } from "zod";

// ===========================================
// Input Types
// ===========================================

export interface IdeaInputData {
  text?: string;
  transcription?: string;
  ocrText?: string;
}

export interface AgentInput {
  ideaId: string;
  rawInput: IdeaInputData;
  previousOutputs?: Record<ResearchAgentType, AgentOutput>;
}

export interface PortfolioInput {
  userId: string;
  ideas: {
    id: string;
    title: string;
    summary: string;
    category: string;
    overallScore: number;
  }[];
}

// ===========================================
// Output Types
// ===========================================

export interface AgentOutput {
  agentType: ResearchAgentType;
  content: unknown;
  confidence: number;
  reasoning?: string;
}

// ===========================================
// Interpreter Agent
// ===========================================

export const InterpretedIdeaSchema = z.object({
  title: z.string().describe("A concise, compelling title for the idea"),
  summary: z
    .string()
    .describe("A 2-3 sentence summary of what the idea is about"),
  problemStatement: z.string().describe("The core problem this idea solves"),
  proposedSolution: z
    .string()
    .describe("How the idea proposes to solve the problem"),
  targetAudience: z
    .array(z.string())
    .describe("Who would benefit from this solution"),
  keyFeatures: z.array(z.string()).describe("Main features or capabilities"),
  uniqueValue: z.string().describe("What makes this idea different or better"),
  category: z
    .enum([
      "saas",
      "marketplace",
      "consumer",
      "enterprise",
      "developer-tools",
      "fintech",
      "healthcare",
      "education",
      "other",
    ])
    .describe("The primary category of this idea"),
});

export type InterpretedIdea = z.infer<typeof InterpretedIdeaSchema>;

// ===========================================
// Market Research Agent
// ===========================================

export const MarketResearchSchema = z.object({
  marketSize: z.object({
    tam: z.string().describe("Total Addressable Market estimate"),
    sam: z.string().describe("Serviceable Addressable Market estimate"),
    som: z.string().describe("Serviceable Obtainable Market estimate"),
    growthRate: z.string().describe("Expected market growth rate"),
  }),
  competitors: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    }),
  ),
  marketTrends: z.array(z.string()),
  barriers: z.array(z.string()).describe("Barriers to entry"),
  opportunities: z.array(z.string()).describe("Market opportunities"),
});

export type MarketResearch = z.infer<typeof MarketResearchSchema>;

// ===========================================
// Trend Analysis Agent
// ===========================================

export const TrendAnalysisSchema = z.object({
  relevantTrends: z.array(
    z.object({
      trend: z.string(),
      relevance: z.enum(["high", "medium", "low"]),
      impact: z.string(),
    }),
  ),
  timingAssessment: z.object({
    verdict: z.enum(["too-early", "right-time", "late", "too-late"]),
    reasoning: z.string(),
  }),
  technologyReadiness: z.object({
    score: z.number().min(1).max(10),
    explanation: z.string(),
  }),
  regulatoryConsiderations: z.array(z.string()),
  socialFactors: z.array(z.string()),
});

export type TrendAnalysis = z.infer<typeof TrendAnalysisSchema>;

// ===========================================
// Execution Friction Agent
// ===========================================

export const ExecutionFrictionSchema = z.object({
  technicalComplexity: z.object({
    score: z.number().min(1).max(10),
    factors: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  resourceRequirements: z.object({
    teamSize: z.string(),
    keyRoles: z.array(z.string()),
    estimatedBudget: z.string(),
    timeToMvp: z.string(),
  }),
  riskFactors: z.array(
    z.object({
      risk: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      mitigation: z.string(),
    }),
  ),
  dependencies: z.array(z.string()),
  quickWins: z
    .array(z.string())
    .describe("Low-effort, high-impact actions to start with"),
});

export type ExecutionFriction = z.infer<typeof ExecutionFrictionSchema>;

// ===========================================
// Synthesis Agent
// ===========================================

export const SynthesisSchema = z.object({
  overallAssessment: z.string(),
  scores: z.object({
    clarity: z.object({
      score: z.number().min(0).max(100),
      explanation: z.string(),
    }),
    marketReadiness: z.object({
      score: z.number().min(0).max(100),
      explanation: z.string(),
    }),
    executionFeasibility: z.object({
      score: z.number().min(0).max(100),
      explanation: z.string(),
    }),
    overall: z.object({
      score: z.number().min(0).max(100),
      explanation: z.string(),
    }),
  }),
  recommendations: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      action: z.string(),
      rationale: z.string(),
    }),
  ),
  nextSteps: z.array(z.string()),
  verdict: z.enum([
    "pursue-immediately",
    "pursue-with-modifications",
    "needs-more-research",
    "pivot-needed",
    "not-recommended",
  ]),
});

export type Synthesis = z.infer<typeof SynthesisSchema>;

// ===========================================
// Deep Research Agent
// ===========================================

export const DeepResearchSchema = z.object({
  marketGaps: z.array(
    z.object({
      gap: z.string(),
      opportunity: z.string(),
      validationSource: z.string().nullable(),
    }),
  ),
  technicalRoadmap: z.object({
    phase1: z.string().describe("MVP / Initial Validation"),
    phase2: z.string().describe("Scaling / Core Features"),
    phase3: z.string().describe("Advanced / Ecosystem"),
  }),
  pivotOptions: z.array(
    z.object({
      direction: z.string(),
      rationale: z.string(),
    }),
  ),
  strategicMoat: z.string().describe("How to build a defensible business"),
});

export type DeepResearch = z.infer<typeof DeepResearchSchema>;

// ===========================================
// Strategic Advisory Agent (Portfolio Level)
// ===========================================

export const StrategicAdvisorySchema = z.object({
  executiveSummary: z.string(),
  portfolioThemes: z.array(z.string()),
  marketPulse: z.array(
    z.object({
      newsItem: z.string(),
      relevance: z.string(),
      impactOnPortfolio: z.enum(["positive", "negative", "neutral"]),
    }),
  ),
  strategicRecommendations: z.array(
    z.object({
      ideaTitle: z.string(),
      recommendation: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
  vcCorner: z.object({
    sentiment: z.string().describe("Current VC sentiment for these categories"),
    brutalHonesty: z.string().describe("The hard truth about these ideas"),
    investmentPotential: z.enum(["high", "medium", "low"]),
  }),
  weeklyActionPlan: z.array(z.string()),
});

export type StrategicAdvisory = z.infer<typeof StrategicAdvisorySchema>;
