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
// Market Research Agent
// ===========================================

export const MarketSizeDataSchema = z.object({
  value: z.string().describe("Market size value in local currency"),
  usdValue: z
    .string()
    .describe("Market size value converted to USD for global comparison"),
  currency: z.string().describe("Local currency code (e.g., USD, INR, EUR)"),
  isEstimated: z
    .boolean()
    .default(false)
    .describe("Whether this value is an estimate vs. verified data"),
  methodology: z.string().describe("How this value was calculated"),
  confidence: z
    .enum(["high", "medium", "low"])
    .optional()
    .describe("Confidence level in the accuracy of this estimate"),
  year: z.number().optional().describe("Year of the data"),
});

export type MarketSizeData = z.infer<typeof MarketSizeDataSchema>;

export const MarketCapitalizationSchema = z.object({
  globalMarketCap: MarketSizeDataSchema.describe(
    "Total market capitalization of the industry globally",
  ),
  industryMarketCap: MarketSizeDataSchema.describe(
    "Market cap of the specific industry/sector",
  ),
  potentialStartupValuation: MarketSizeDataSchema.describe(
    "Potential valuation context for fundraising (e.g., comparable exits)",
  ),
  methodology: z.string().describe("Methodology used for market cap analysis"),
});

export type MarketCapitalization = z.infer<typeof MarketCapitalizationSchema>;

export const LocationMarketSizeSchema = z.object({
  location: z.string(), // e.g., "United States", "Global"
  tam: MarketSizeDataSchema,
  sam: MarketSizeDataSchema.describe(
    "Serviceable Addressable Market - portion you can target",
  ),
  som: MarketSizeDataSchema.describe(
    "Serviceable Obtainable Market - realistic capture in 3-5 years",
  ),
  marketCap: MarketCapitalizationSchema.optional().describe(
    "Market capitalization data for the industry",
  ),
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
// Synthesis Agent - SIMPLIFIED
// ===========================================

export const SynthesisSchema = z.object({
  overallAssessment: z.string().describe("2-3 sentence overall assessment"),
  clarityScore: z.number().min(0).max(100).describe("Clarity score"),
  clarityExplanation: z.string().describe("Brief explanation of clarity score"),
  marketScore: z.number().min(0).max(100).describe("Market readiness score"),
  marketExplanation: z.string().describe("Brief explanation of market score"),
  executionScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Execution feasibility score"),
  executionExplanation: z
    .string()
    .describe("Brief explanation of execution score"),
  overallScore: z.number().min(0).max(100).describe("Overall score"),
  overallExplanation: z.string().describe("Brief explanation of overall score"),
  recommendations: z
    .array(z.string())
    .describe("3-5 actionable recommendations"),
  nextSteps: z.array(z.string()).describe("3-5 immediate next steps"),
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
// Deep Research Agent - SIMPLIFIED
// ===========================================

export const DeepResearchSchema = z.object({
  marketGaps: z
    .array(z.string())
    .describe("3-5 key market gaps or opportunities"),
  technicalRoadmap: z.object({
    phase1: z.string().describe("MVP / Initial Validation approach"),
    phase2: z.string().describe("Scaling / Core Features approach"),
    phase3: z.string().describe("Advanced / Ecosystem approach"),
  }),
  pivotOptions: z
    .array(z.string())
    .describe("2-3 potential pivot directions if needed"),
  strategicMoat: z
    .string()
    .describe("How to build a defensible business (1-2 sentences)"),
});

export type DeepResearch = z.infer<typeof DeepResearchSchema>;
export type DeepResearchOutput = AgentOutput & {
  agentType: "DEEP_RESEARCH";
  content: DeepResearch;
};

// ===========================================
// Strategic Advisory Agent (Portfolio Level) - SIMPLIFIED
// ===========================================

export const StrategicAdvisorySchema = z.object({
  executiveSummary: z
    .string()
    .describe("2-3 sentence summary of portfolio status"),
  portfolioThemes: z
    .array(z.string())
    .describe("3-5 key themes across portfolio"),
  marketPulse: z
    .array(z.string())
    .describe("3-5 important market observations"),
  verdicts: z
    .array(z.string())
    .describe(
      "Quick verdicts for each idea: Go/Pause/Kill with 1-sentence reason",
    ),
  primaryFocus: z
    .object({
      ideaTitle: z.string(),
      allocation: z.number().min(0).max(100),
    })
    .describe("Main focus idea with time allocation"),
  brainDrillingQuestions: z
    .array(z.string())
    .describe("3-5 important questions to investigate"),
  vcSentiment: z
    .string()
    .describe("Current VC sentiment for this portfolio's sectors"),
  investmentPotential: z
    .enum(["high", "medium", "low"])
    .describe("Overall investment potential"),
  weeklyFocus: z.string().describe("One priority action for this week"),
  topRisks: z.array(z.string()).describe("3 biggest risks to monitor"),
  failureReasons: z
    .array(z.string())
    .describe("3-5 common failure reasons to watch for"),
});

export type StrategicAdvisory = z.infer<typeof StrategicAdvisorySchema>;

// ===========================================
// State & Delta Schema - SIMPLIFIED
// ===========================================

export const StateSchema = z.object({
  ideaId: z.string(),
  mau: z.number().nullable(),
  cac: z.number().nullable(),
  ltv: z.number().nullable(),
  revenue: z.number().nullable(),
  assumptions: z.array(z.string()).describe("Key assumptions to track"),
  signals: z.array(z.string()).describe("Important signals to monitor"),
  lastVerdict: z.string().nullable().describe("Latest verdict: Go/Pause/Kill"),
  notes: z.string().nullable().describe("Notes on current status"),
});

export type IdeaState = z.infer<typeof StateSchema>;
