#!/usr/bin/env npx tsx

import { db } from "../lib/db";

/**
 * Bootstrap script to add users to the IdeasVault Accelerator Program
 *
 * Usage:
 *   pnpm bootstrap:accelerator add-user --email=user@email.com --role=PROGRAM_MANAGER
 *   pnpm bootstrap:accelerator create- accelerator
 *   pnpm bootstrap:accelerator list-members
 */

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "create-accelerator":
      await createAccelerator();
      break;
    case "add-user":
      await addUserToAccelerator();
      break;
    case "list-members":
      await listMembers();
      break;
    default:
      console.log("Usage:");
      console.log("  pnpm bootstrap:accelerator create-accelerator");
      console.log(
        "  pnpm bootstrap:accelerator add-user --email=EMAIL --role=ROLE",
      );
      console.log("  pnpm bootstrap:accelerator list-members");
      console.log("");
      console.log(
        "Roles: OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD, MENTOR, OBSERVER",
      );
  }
}

async function createAccelerator() {
  // Find the first admin user (USER.role === 'ADMIN')
  const adminUser = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true, name: true },
  });

  // Or use a specific email if provided
  const emailArg = args.find((a) => a.startsWith("--email="));
  const email = emailArg?.split("=")[1] || "flynn@safuh.com";

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    console.error(
      `User with email ${email} not found. Please create the user first.`,
    );
    process.exit(1);
  }

  // Check if accelerator already exists
  const existingAccelerator = await db.accelerator.findUnique({
    where: { slug: "ideasvault-accelerator" },
  });

  if (existingAccelerator) {
    console.log("Accelerator already exists!");
    console.log(`Name: ${existingAccelerator.name}`);
    console.log(`Slug: ${existingAccelerator.slug}`);
    return;
  }

  // Create the IdeasVault Accelerator Program
  const accelerator = await db.accelerator.create({
    data: {
      name: "IdeasVault Accelerator Program",
      slug: "ideasvault-accelerator",
      description:
        "The official IdeasVault internal accelerator program for startups. Join our cohort to get weekly coaching, mentor access, and investor connections.",
      programType: "accelerator",
      durationWeeks: 12,
      benefits:
        "- Weekly AI-powered coaching\n- Mentor matching\n- Investor demo day\n- Community access\n- Resources and tools",
      requirements:
        "- Active startup on IdeasVault\n- Commitment to weekly updates\n- Open to feedback and coaching",
      maxStartups: 50,
      isPublic: true,
      isActive: true,
      ownerId: user.id,
    },
  });

  // Add the owner as a member with OWNER role
  await db.acceleratorMember.create({
    data: {
      acceleratorId: accelerator.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  console.log("✅ Created IdeasVault Accelerator Program");
  console.log(`   Name: ${accelerator.name}`);
  console.log(`   Owner: ${user.email}`);
  console.log(`   URL: /admin/accelerators/${accelerator.slug}`);
}

async function addUserToAccelerator() {
  const emailArg = args.find((a) => a.startsWith("--email="));
  const roleArg = args.find((a) => a.startsWith("--role="));

  if (!emailArg || !roleArg) {
    console.error("Please provide --email and --role");
    process.exit(1);
  }

  const email = emailArg.split("=")[1];
  const role = roleArg.split("=")[1] as any;

  // Validate role
  const validRoles = [
    "OWNER",
    "PROGRAM_MANAGER",
    "OPERATIONS_LEAD",
    "MENTOR",
    "OBSERVER",
  ];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role: ${role}`);
    console.log(`Valid roles: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  // Find user
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  // Find accelerator
  const accelerator = await db.accelerator.findUnique({
    where: { slug: "ideasvault-accelerator" },
  });

  if (!accelerator) {
    console.error("Accelerator not found. Run create-accelerator first.");
    process.exit(1);
  }

  // Check if already a member
  const existingMember = await db.acceleratorMember.findUnique({
    where: {
      acceleratorId_userId: {
        acceleratorId: accelerator.id,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    console.log(
      `User ${email} is already a member with role ${existingMember.role}`,
    );
    console.log(`Updating role to ${role}...`);

    await db.acceleratorMember.update({
      where: { id: existingMember.id },
      data: { role },
    });

    console.log("✅ Role updated!");
    return;
  }

  // Add user to accelerator
  await db.acceleratorMember.create({
    data: {
      acceleratorId: accelerator.id,
      userId: user.id,
      role,
    },
  });

  console.log(`✅ Added ${email} to accelerator with role ${role}`);
}

async function listMembers() {
  const accelerator = await db.accelerator.findUnique({
    where: { slug: "ideasvault-accelerator" },
    include: {
      members: {
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      },
    },
  });

  if (!accelerator) {
    console.error("Accelerator not found. Run create-accelerator first.");
    process.exit(1);
  }

  console.log(`Members of ${accelerator.name}:`);
  console.log("");

  for (const member of accelerator.members) {
    console.log(
      `  - ${member.user.email} (${member.user.name || "No name"}) - ${member.role}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
