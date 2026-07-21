#!/usr/bin/env npx tsx

import { db } from "../lib/db";

async function migrate() {
  console.log("=== Post-migration cleanup ===\n");

  // --- 1. Personal orgs for existing users ---
  console.log("Step 1: Creating personal orgs for users without one...");

  const users = await db.user.findMany({
    include: { members: true },
  });

  let personalOrgsCreated = 0;
  let personalOrgsSkipped = 0;

  for (const user of users) {
    const isOwnerInAnyOrg = user.members.some((m) => m.role === "owner");
    if (isOwnerInAnyOrg) {
      personalOrgsSkipped++;
      continue;
    }

    const slug =
      (user.name || user.email || "user")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 60) || `user-${user.id.slice(0, 8)}`;

    const existing = await db.organization.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${user.id.slice(0, 6)}` : slug;

    await db.organization.create({
      data: {
        name: `${user.name || user.email || "User"}'s Organization`,
        slug: finalSlug,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    personalOrgsCreated++;
    console.log(`  Created personal org for ${user.email || user.id}`);
  }

  console.log(
    `  Done: ${personalOrgsCreated} created, ${personalOrgsSkipped} skipped (already has org)\n`,
  );

  // --- 2. Mark ideas as CONVERTED ---
  console.log("Step 2: Marking ideas as CONVERTED for linked startups...");

  const startups = await db.startup.findMany({
    where: { ideaId: { not: null } },
    select: { id: true, name: true, ideaId: true },
  });

  let converted = 0;
  let alreadyConverted = 0;

  for (const startup of startups) {
    if (!startup.ideaId) continue;

    const idea = await db.idea.findUnique({
      where: { id: startup.ideaId },
      select: { id: true, status: true },
    });

    if (!idea) {
      console.log(`  SKIP [${startup.name}] — idea not found`);
      continue;
    }

    if (idea.status === "CONVERTED") {
      alreadyConverted++;
      continue;
    }

    await db.idea.update({
      where: { id: startup.ideaId },
      data: { status: "CONVERTED" },
    });

    converted++;
    console.log(`  OK  [${startup.name}] → marked CONVERTED`);
  }

  console.log(
    `  Done: ${converted} converted, ${alreadyConverted} already converted\n`,
  );

  console.log("=== Post-migration cleanup complete ===");
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
