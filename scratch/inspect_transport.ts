import { DefaultChatTransport, useChat } from "ai";

async function main() {
  console.log("DefaultChatTransport properties:", Object.getOwnPropertyNames(DefaultChatTransport));
  console.log("DefaultChatTransport prototype properties:", Object.getOwnPropertyNames(DefaultChatTransport.prototype));
  console.log("useChat function source:", useChat.toString());
}
main().catch(console.error);
