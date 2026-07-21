import { db } from "../lib/db";
import "dotenv/config";

async function createTestStartup() {
  const email = process.argv[2];
  if (!email) {
    console.error("Email required");
    process.exit(1);
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      process.exit(1);
    }

    // Check if startup already exists to avoid unique constraint violations
    const existing = await db.startup.findUnique({
      where: { slug: "test-strategic-co" },
    });

    const startup =
      existing ||
      (await db.startup.create({
        data: {
          id: "test-strategic-co",
          userId: user.id,
          name: "Test Strategic Co.",
          slug: "test-strategic-co",
          tagline: "Unlocking growth with strategic coaching",
          description:
            "A strategic mock startup for testing AI chat capabilities.",
          stage: "IDEA",
          location: "San Francisco, CA",
          primaryMetricType: "USER_CONVERSATIONS",
        },
      }));

    // Create a mock conversation that exists in DB for chunk pre-compilation
    const existingConv = await db.startupConversation.findFirst({
      where: { startupId: startup.id, id: "mock-compilation-id" },
    });
    if (!existingConv) {
      await db.startupConversation.create({
        data: {
          id: "mock-compilation-id",
          startupId: startup.id,
          title: "Mock Compilation Conversation",
          isActive: true,
          messageCount: 1,
          messages: {
            create: {
              role: "user",
              content: "Hello compilation",
            },
          },
        },
      });
    }

    console.log(`SUCCESS:${startup.slug}`);
  } catch (error: any) {
    console.error("Failed to create startup:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

createTestStartup();
