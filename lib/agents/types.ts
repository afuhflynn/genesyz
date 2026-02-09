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
  locationContext?: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    timezone?: string;
    currency?: string;
    isGlobal?: boolean;
  };
}

export interface PortfolioInput {
  userId: string;
  ideas: {
    id: string;
    title: string;
    summary: string;
    category: string;
    overallScore: number;
    metrics?: any;
    history?: any[];
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

export const MarketSizeDataSchema = z.object({
  value: z.string(),
  methodology: z.string(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  year: z.number().optional(),
  currency: z.string().optional(),
});

export type MarketSizeData = z.infer<typeof MarketSizeDataSchema>;

export const LocationMarketSizeSchema = z.object({
  location: z.string(), // e.g., "United States", "Global"
  tam: MarketSizeDataSchema,
  sam: MarketSizeDataSchema,
  som: MarketSizeDataSchema,
  growthRate: z.object({
    value: z.string(),
    methodology: z.string(),
    period: z.string().optional(), // e.g., "CAGR 2024-2029"
  }),
  confidence: z.enum(["high", "medium", "low"]),
  dataSource: z.string().optional(),
});

export type LocationMarketSize = z.infer<typeof LocationMarketSizeSchema>;

export const MarketResearchSchema = z.object({
  marketSize: z.object({
    global: LocationMarketSizeSchema,
    regional: LocationMarketSizeSchema.optional(),
    local: LocationMarketSizeSchema.optional(),
    year: z.number().optional(),
    currency: z.string().optional(),
    methodology: z
      .string()
      .describe("Overall methodology used for market sizing"),
  }),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        strengths: z.array(z.string()).max(5),
        weaknesses: z.array(z.string()).max(5),
      }),
    )
    .max(6),
  marketTrends: z.array(z.string()).max(5),
  barriers: z.array(z.string()).max(5),
  opportunities: z.array(z.string()).max(5),
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
  verdicts: z.array(
    z.object({
      ideaId: z.string(),
      ideaTitle: z.string(),
      verdict: z.enum(["Go", "Pause", "Kill"]),
      onePriority: z.string(),
      oneStop: z.string(),
      topRisk: z.object({
        category: z.enum(["Market", "Product", "Financial", "Team"]),
        description: z.string(),
      }),
      evidence: z.array(z.string()),
      counterArgument: z.string(),
      timeAllocation: z.number().min(0).max(100).optional(),
      status: z.enum(["primary", "validation", "monitoring"]).optional(),
    }),
  ),
  brainDrillingQuestions: z.array(z.string()),
  vcCorner: z.object({
    sentiment: z.string().describe("Current VC sentiment for these categories"),
    brutalHonesty: z.string().describe("The hard truth about these ideas"),
    investmentPotential: z.enum(["high", "medium", "low"]),
    investorAngle: z.string().describe("Investor Angle of the Week"),
  }),
  weeklyActionPlan: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      owner: z.string(),
      due_date: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      estimated_time_allocation: z.union([z.string(), z.number()]),
      success_criteria: z.string(),
      kill_criteria: z.string(),
      description: z.string().optional(),
      linked_resources: z.array(z.string()).optional(),
    }),
  ),
  primaryFocus: z.object({
    ideaTitle: z.string(),
    allocation: z.number().min(0).max(100),
  }),
  riskCliffs: z.array(
    z.object({
      ideaTitle: z.string(),
      failureReason: z.string(),
    }),
  ),
  failureReasons: z.array(z.string()).optional(),
});

export type StrategicAdvisory = z.infer<typeof StrategicAdvisorySchema>;

// ===========================================
// State & Delta Schema
// ===========================================

export const StateSchema = z.object({
  ideaId: z.string(),
  metrics: z.object({
    mau: z.number().nullable(),
    cac: z.number().nullable(),
    ltv: z.number().nullable(),
    revenue: z.number().nullable(),
    other: z.record(z.any(), z.any()).nullable(),
  }),
  assumptions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      confidence: z.enum(["low", "med", "high"]),
      evidence: z.array(z.string()),
    }),
  ),
  signals: z.array(
    z.object({
      type: z.enum(["market", "competitor", "user", "technical"]),
      text: z.string(),
      source: z.string().optional(),
    }),
  ),
  lastVerdict: z
    .object({
      date: z.string(),
      verdict: z.enum(["Go", "Pause", "Kill"]),
      notes: z.string(),
    })
    .nullable(),
});

export type IdeaState = z.infer<typeof StateSchema>;
