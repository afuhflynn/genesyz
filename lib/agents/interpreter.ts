import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { db } from "@/lib/db";
import { detectLocationFromText } from "@/lib/location";
import { extractUrlsFromSources } from "@/lib/scraping";
import { hashString } from "@/lib/utils";
import {
  type AgentInput,
  type AgentOutput,
  InterpretedIdeaSchema,
} from "./types";

const primaryModel = mistral("open-mixtral-8x7b");
const fallbackModel = google("gemini-2.5-flash");

const SYSTEM_PROMPT = `You are an expert startup analyst and idea interpreter. Your role is to take raw, unstructured founder ideas and transform them into clear, structured representations.

Guidelines:
- Extract the core essence of the idea even if the input is messy or incomplete
- Identify implicit problems and solutions that the founder may not have explicitly stated
- Be realistic but constructive - don't inflate the idea's potential
- Use clear, professional language
- If information is genuinely missing, make reasonable inferences but note uncertainty`;

export async function runInterpreterAgent(
  input: AgentInput,
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

  // Extract URLs and detect location mentioned in text
  const extractedUrls = extractUrlsFromSources({
    text: rawInput.text || undefined,
    transcription: rawInput.transcription || undefined,
    ocrText: rawInput.ocrText || undefined,
  });

  const locationMentions = detectLocationFromText(combinedInput);

  // Build location context for prompt
  let locationContext = "";
  if (locationMentions.length > 0) {
    const locations = locationMentions.map((l) => l.name).join(", ");
    locationContext = `\n\nLocation mentions detected: ${locations}. Consider these locations in your analysis if relevant.`;
  }

  const prompt = `Analyze and structure the following founder idea:

${combinedInput}${locationContext}

Transform this into a structured idea representation. Be thorough but concise.`;

  const promptHash = await hashString(prompt);

  const startTime = Date.now();
  let result: Awaited<
    ReturnType<typeof generateObject<typeof InterpretedIdeaSchema>>
  >;
  let modelUsed: string;

  try {
    result = await generateObject({
      model: primaryModel,
      schema: InterpretedIdeaSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    modelUsed = "open-mixtral-8x7b";
  } catch (error) {
    console.warn(
      `[INTERPRETER] Mistral primary model failed, falling back to Gemini:`,
      error,
    );
    result = await generateObject({
      model: fallbackModel,
      schema: InterpretedIdeaSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });
    modelUsed = "gemini-2.5-flash";
  }

  const latencyMs = Date.now() - startTime;

  // Log the research call
  await db.researchLog.create({
    data: {
      ideaId,
      agentType: "INTERPRETER",
      promptHash,
      prompt,
      response: JSON.stringify(result.object),
      model: modelUsed,
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

  // Update idea with interpreted prompt and extracted data
  const interpretedPrompt = `Title: ${result.object.title}\n\nSummary: ${result.object.summary}\n\nProblem: ${result.object.problemStatement}\n\nSolution: ${result.object.proposedSolution}`;

  await db.idea.update({
    where: { id: ideaId },
    data: {
      interpretedPrompt,
      title: result.object.title,
      summary: result.object.summary,
      // Merge with existing URLs if any
      extractedUrls: {
        push: extractedUrls.map((u) => u.normalizedUrl),
      },
    },
  });

  return {
    agentType: "INTERPRETER",
    content: result.object,
    confidence,
    reasoning: `Interpreted from ${inputSources} input source(s). ${extractedUrls.length > 0 ? `Found ${extractedUrls.length} URL(s).` : ""} ${locationMentions.length > 0 ? `Detected ${locationMentions.length} location mention(s).` : ""}`,
  };
}
