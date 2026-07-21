import { db } from "../lib/db";

async function listUsers() {
  console.log("Listing users from Neon database...");
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error: any) {
    console.error("Error fetching users:", error.message || error);
  } finally {
    await db.$disconnect();
  }
}

listUsers();
