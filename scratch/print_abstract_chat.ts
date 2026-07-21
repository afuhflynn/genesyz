import * as ai from "ai";

async function main() {
  console.log(
    "ai exports:",
    Object.keys(ai).filter((k) => k.includes("Chat") || k.includes("Abstract")),
  );
}
main().catch(console.error);
