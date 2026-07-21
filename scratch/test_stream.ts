import { streamText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import "dotenv/config";

async function main() {
  console.log("Testing streamText with Mistral...");
  try {
    const result = await streamText({
      model: mistral("mistral-small-latest"),
      system: "You are a VC coach.",
      messages: [
        {
          role: "user",
          content:
            "Based on our current stage and metrics, what should be our top 3 growth priorities?",
        },
      ],
    });

    console.log("Stream started...");
    let fullText = "";
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
      fullText += textPart;
    }
    console.log("\nStream finished successfully!");
    console.log("Full text length:", fullText.length);
  } catch (error: any) {
    console.error("Stream failed with error:", error);
  }
}

main();
