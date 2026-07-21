import { db } from "../lib/db";
import "dotenv/config";

async function getCode() {
  const email = process.argv[2];
  if (!email) {
    console.error("Email parameter required");
    process.exit(1);
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { verificationCode: true },
    });
    if (user?.verificationCode) {
      console.log(`CODE:${user.verificationCode}`);
    } else {
      console.log("CODE:null");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

getCode();
