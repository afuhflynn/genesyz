import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  type InterpretedIdea,
  ExecutionFrictionSchema,
} from "./types";

const model = google("gemini-2.5-flash");

const SYSTEM_PROMPT = `You are a seasoned startup operator and technical advisor. Your role is to assess the practical challenges of executing on a startup idea.

Guidelines:
- Be realistic about technical complexity
- Consider the founder's likely constraints (budget, team, time)
- Identify non-obvious dependencies and blockers
- Provide actionable mitigation strategies
- Suggest quick wins to build momentum
- Consider both technical and operational challenges`;

export async function runExecutionFrictionAgent(
  input: AgentInput
): Promise<AgentOutput> {
  const { ideaId, previousOutputs } = input;

  const interpretedIdea = previousOutputs?.INTERPRETER
    ?.content as InterpretedIdea;

  if (!interpretedIdea) {
    throw new Error("ExecutionFrictionAgent requires INTERPRETER output");
  }

  const prompt = `Assess the execution challenges for the following startup idea:

**Title:** ${interpretedIdea.title}
**Summary:** ${interpretedIdea.summary}
**Problem:** ${interpretedIdea.problemStatement}
**Solution:** ${interpretedIdea.proposedSolution}
**Key Features:** ${interpretedIdea.keyFeatures.join(", ")}
**Category:** ${interpretedIdea.category}

Analyze technical complexity, resource requirements, risks, and provide actionable recommendations.`;

  const promptHash = await hashString(prompt);
  const startTime = Date.now();

  const result = await generateObject({
    model,
    schema: ExecutionFrictionSchema,
    system: SYSTEM_PROMPT,
    prompt,
  });

  const latencyMs = Date.now() - startTime;

  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "EXECUTION_FRICTION",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: "gemini-2.5-flash",
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  const techComplexity = result.object.technicalComplexity.score;
  const riskCount = result.object.riskFactors.length;
  // Lower complexity and fewer high-severity risks = higher confidence
  const confidence = Math.max(
    0.4,
    0.9 - techComplexity * 0.03 - riskCount * 0.02
  );

  return {
    agentType: "EXECUTION_FRICTION",
    content: result.object,
    confidence,
    reasoning: `Technical complexity: ${techComplexity}/10, ${riskCount} risk factors identified`,
  };
}
