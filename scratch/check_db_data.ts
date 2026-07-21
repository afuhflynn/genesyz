import { db } from "../lib/db";

async function checkData() {
  console.log("Checking database record counts on Neon...");
  try {
    const userCount = await db.user.count();
    console.log(`Users: ${userCount}`);
    
    const startupCount = await db.startup.count();
    console.log(`Startups: ${startupCount}`);
    
    const ideaCount = await db.idea.count();
    console.log(`Ideas: ${ideaCount}`);
  } catch (error: any) {
    console.error("Error querying database:", error.message || error);
  } finally {
    await db.$disconnect();
  }
}

checkData();
