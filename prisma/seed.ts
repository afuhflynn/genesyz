import { db } from "@/lib/db";
import { hashString } from "@/lib/utils";
import { PLANS } from "@/lib/polar/client";

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create a test user
  const user = await db.user.upsert({
    where: { email: "founder@example.com" },
    update: {},
    create: {
      email: "founder@example.com",
      name: "Alice Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // 2. Create entitlement
  await db.entitlement.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: "PRO",
      maxActiveIdeas: PLANS.PRO.maxActiveIdeas,
      status: "ACTIVE",
    },
  });

  console.log("💳 Created PRO entitlement");

  // 3. Create a researched idea
  const idea = await db.idea.create({
    data: {
      userId: user.id,
      title: "AI-Powered Plant Care Assistant",
      summary:
        "A mobile app that uses computer vision to diagnose plant diseases and provide personalized care schedules.",
      status: "RESEARCHED",
      researchedAt: new Date(),
      inputs: {
        create: [
          {
            type: "TEXT",
            content:
              "I want to build an app where you take a photo of your houseplant and it tells you what it is, if it's sick, and how to water it. It should send push notifications for watering.",
          },
        ],
      },
    },
  });

  console.log(`💡 Created idea: ${idea.title}`);

  // 4. Create research packets
  const interpreterContent = {
    title: "AI-Powered Plant Care Assistant",
    summary:
      "A mobile app that uses computer vision to diagnose plant diseases and provide personalized care schedules.",
    problemStatement:
      "Houseplant owners struggle to identify plants, diagnose health issues, and maintain consistent watering schedules, leading to plant death.",
    proposedSolution:
      "An AI-driven mobile application that identifies plants via camera, diagnoses diseases, and creates automated, species-specific care reminders.",
    targetAudience: [
      "Urban millennials",
      "Gardening hobbyists",
      "First-time plant owners",
    ],
    keyFeatures: [
      "Visual plant identification",
      "Disease diagnosis",
      "Watering reminders",
      "Light meter",
    ],
    uniqueValue:
      "Combines identification with ongoing care management in a single seamless interface.",
    category: "consumer",
  };

  await db.researchPacket.create({
    data: {
      ideaId: idea.id,
      agentType: "INTERPRETER",
      content: interpreterContent,
      confidence: 0.95,
    },
  });

  await db.researchPacket.create({
    data: {
      ideaId: idea.id,
      agentType: "MARKET_RESEARCH",
      content: {
        marketSize: {
          tam: "$1.7 Billion (Global Indoor Farming Market)",
          sam: "$400 Million (US Gardening Apps)",
          som: "$40 Million (10% Market Share)",
          growthRate: "12% CAGR",
        },
        competitors: [
          {
            name: "Planta",
            description: "Leading plant care app",
            strengths: ["Great UI", "Large database"],
            weaknesses: ["Expensive subscription"],
          },
          {
            name: "PictureThis",
            description: "Identification focused",
            strengths: ["Accurate ID"],
            weaknesses: ["Limited care features"],
          },
        ],
        marketTrends: [
          "Rise of biophilic design",
          "Urban gardening boom",
          "Wellness tech",
        ],
        barriers: ["High competition", "Data accuracy requirements"],
        opportunities: [
          "Integration with smart home devices",
          "Plant marketplace",
        ],
      },
      confidence: 0.85,
    },
  });

  // 5. Create scores
  await db.ideaScore.create({
    data: {
      ideaId: idea.id,
      clarityScore: 95,
      clarityExplanation: "The idea is very clear and well-defined.",
      marketScore: 80,
      marketExplanation: "Growing market but significant competition.",
      executionScore: 75,
      executionExplanation:
        "Technically feasible but requires good computer vision models.",
      overallScore: 83,
      overallExplanation:
        "Strong consumer concept with clear value proposition.",
    },
  });

  console.log("📊 Created research packets and scores");
  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
