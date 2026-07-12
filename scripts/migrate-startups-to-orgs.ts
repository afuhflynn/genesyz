#!/usr/bin/env npx tsx

import { db } from "../lib/db";

const ROLE_MAP: Record<string, string> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

async function migrate() {
  console.log("Starting migration: Startups → Organizations...");

  const startups = await db.startup.findMany({
    include: { members: true },
  });

  console.log(`Found ${startups.length} startups to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const startup of startups) {
    if (startup.organizationId) {
      console.log(`  SKIP [${startup.slug}] — already has organization`);
      skipped++;
      continue;
    }

    const org = await db.organization.create({
      data: {
        name: startup.name,
        slug: `startup-${startup.slug}`,
      },
    });

    const membersToCreate: { userId: string; role: string }[] = [];

    membersToCreate.push({ userId: startup.userId, role: "owner" });

    for (const sm of startup.members) {
      const role = ROLE_MAP[sm.role];
      if (role && sm.userId !== startup.userId) {
        membersToCreate.push({ userId: sm.userId, role });
      }
    }

    for (const member of membersToCreate) {
      await db.member.create({
        data: {
          organizationId: org.id,
          userId: member.userId,
          role: member.role,
        },
      });
    }

    await db.startup.update({
      where: { id: startup.id },
      data: { organizationId: org.id },
    });

    migrated++;
    console.log(
      `  OK  [${startup.slug}] → org ${org.slug} (${membersToCreate.length} members)`,
    );
  }

  console.log(`\nDone. ${migrated} migrated, ${skipped} skipped.`);
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
