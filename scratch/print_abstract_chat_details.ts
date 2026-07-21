import { AbstractChat } from "ai";

async function main() {
  console.log(
    "AbstractChat prototype properties:",
    Object.getOwnPropertyNames(AbstractChat.prototype),
  );
}
main().catch(console.error);
