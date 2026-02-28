import { db } from "../lib/db";
import { sanitizeUrlStrings } from "../lib/scraping";

async function main() {
  const ideas = await db.idea.findMany({
    select: {
      id: true,
      extractedUrls: true,
    },
  });

  let updatedCount = 0;

  for (const idea of ideas) {
    const sanitized = sanitizeUrlStrings(idea.extractedUrls as unknown[]);

    const unchanged =
      sanitized.length === idea.extractedUrls.length &&
      sanitized.every((url, idx) => url === idea.extractedUrls[idx]);

    if (unchanged) continue;

    await db.idea.update({
      where: { id: idea.id },
      data: {
        extractedUrls: {
          set: sanitized,
        },
      },
    });

    updatedCount += 1;
  }

  console.log(`Repaired extractedUrls for ${updatedCount} idea(s).`);
}

main()
  .catch((error) => {
    console.error("Failed to repair extractedUrls", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
