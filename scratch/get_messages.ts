import { db } from "../lib/db";

async function main() {
  const convs = await db.startupConversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 1,
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (convs.length === 0) {
    console.log("No conversations found.");
    return;
  }

  const conv = convs[0];
  console.log(`CONVERSATION ID: ${conv.id}`);
  console.log(`TITLE: ${conv.title}`);
  console.log(`MESSAGE COUNT: ${conv.messageCount}`);
  console.log("MESSAGES:");
  for (const msg of conv.messages) {
    console.log(`- [${msg.role}] ${msg.content.slice(0, 100)}...`);
  }
}

main().catch(console.error);
