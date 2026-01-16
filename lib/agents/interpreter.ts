import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  InterpretedIdeaSchema,
} from "./types";

// const model = google("gemini-3-flash-preview");
const model = mistral("mistral-large-latest");

const SYSTEM_PROMPT = `You are an expert startup analyst and idea interpreter. Your role is to take raw, unstructured founder ideas and transform them into clear, structured representations.

Guidelines:
- Extract the core essence of the idea even if the input is messy or incomplete
- Identify implicit problems and solutions that the founder may not have explicitly stated
- Be realistic but constructive - don't inflate the idea's potential
- Use clear, professional language
- If information is genuinely missing, make reasonable inferences but note uncertainty`;

export async function runInterpreterAgent(
  input: AgentInput
): Promise<AgentOutput> {
  const { ideaId, rawInput } = input;

  // Combine all input sources
  const combinedInput = [
    rawInput.text && `Text Input: ${rawInput.text}`,
    rawInput.transcription && `Voice Transcription: ${rawInput.transcription}`,
    rawInput.ocrText && `Image OCR: ${rawInput.ocrText}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = `Analyze and structure the following founder idea:

${combinedInput}

Transform this into a structured idea representation. Be thorough but concise.`;

  const promptHash = await hashString(prompt);

  const startTime = Date.now();

  const result = await generateObject({
    model,
    schema: InterpretedIdeaSchema,
    system: SYSTEM_PROMPT,
    prompt,
  });

  const latencyMs = Date.now() - startTime;

  // Log the research call
  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "INTERPRETER",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: "gemini-3-flash-preview",
      tokensUsed: result.usage?.totalTokens,
      latencyMs,
    },
  });

  // Calculate confidence based on input completeness
  const inputSources = [
    rawInput.text,
    rawInput.transcription,
    rawInput.ocrText,
  ].filter(Boolean).length;
  const confidence = Math.min(0.5 + inputSources * 0.15, 0.95);

  return {
    agentType: "INTERPRETER",
    content: result.object,
    confidence,
    reasoning: `Interpreted from ${inputSources} input source(s)`,
  };
}
