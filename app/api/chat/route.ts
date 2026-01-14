import { mistral } from "@ai-sdk/mistral";
import { streamText } from "ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: mistral("mistral-large-latest"),
    system:
      "You are a helpful AI assistant for Ideas Vault. Help users brainstorm, refine, and research their ideas.",
    messages,
  });

  return result.toDataStreamResponse();
}
