import { db } from "../lib/db";

async function main() {
  console.log("Seeding Genesyz Accelerator Program...");

  // Find or create a placeholder owner (we'll need to assign this later)
  const placeholderUser = await db.user.findFirst({
    where: { email: "flynn@safuh.com" },
    select: { id: true, email: true, name: true },
  });

  if (!placeholderUser) {
    console.log(
      "No user found with email flynn@safuh.com. Please create the admin user first.",
    );
    console.log("Skipping accelerator seed.");
    return;
  }

  // Check if accelerator already exists
  const existingAccelerator = await db.accelerator.findUnique({
    where: { slug: "genesyz-accelerator" },
  });

  if (existingAccelerator) {
    console.log("Accelerator already exists, skipping seed.");
    return;
  }

  // Create the Genesyz Accelerator Program
  const accelerator = await db.accelerator.create({
    data: {
      name: "Genesyz Accelerator Program",
      slug: "genesyz-accelerator",
      description:
        "The official Genesyz internal accelerator program for startups. Join our cohort to get weekly coaching, mentor access, and investor connections.",
      programType: "accelerator",
      durationWeeks: 12,
      benefits:
        "- Weekly AI-powered coaching\n- Mentor matching\n- Investor demo day\n- Community access\n- Resources and tools",
      requirements:
        "- Active startup on Genesyz\n- Commitment to weekly updates\n- Open to feedback and coaching",
      maxStartups: 50,
      isPublic: true,
      isActive: true,
      ownerId: placeholderUser.id,
    },
  });

  // Add the owner as a member with OWNER role
  await db.acceleratorMember.create({
    data: {
      acceleratorId: accelerator.id,
      userId: placeholderUser.id,
      role: "OWNER",
    },
  });

  console.log(`Created accelerator: ${accelerator.name} (${accelerator.slug})`);
  console.log(`Added ${placeholderUser.email} as OWNER`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
