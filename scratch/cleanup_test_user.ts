import { db } from "../lib/db";
import "dotenv/config";

async function cleanup() {
  console.log("Cleaning up test data on Neon...");
  try {
    // Delete startup
    await db.startup.deleteMany({
      where: { slug: "test-strategic-co" },
    });

    // Delete user
    await db.user.deleteMany({
      where: { email: "test-coach-user-99@genesyz.ai" },
    });

    console.log("Test user and startup deleted.");
  } catch (error: any) {
    console.error("Cleanup failed:", error.message || error);
  } finally {
    await db.$disconnect();
  }
}

cleanup();
