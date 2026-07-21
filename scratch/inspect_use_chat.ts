import { useChat } from "@ai-sdk/react";

async function main() {
  console.log("useChat type:", typeof useChat);
  console.log("useChat function source:", useChat.toString().slice(0, 500));
}
main().catch(console.error);
