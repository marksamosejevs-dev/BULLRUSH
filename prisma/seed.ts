// Development seed data — THREE DEMO OPPORTUNITIES ONLY.
//
// Every record below is marked isDemoData: true and every "trend" or
// "market" claim is explicitly labeled illustrative. None of it is real
// research. It exists to exercise the dashboard, scoring, economics and
// state machine before a real Scout/Validator agent exists (Phase 2).

import { PrismaClient } from "@prisma/client";
import { calculateOverallScore, deriveRiskLevel } from "../lib/scoring";

const prisma = new PrismaClient();

const DEMO_TAG = "[DEMO DATA — illustrative only, not real market research]";

const demoOpportunities = [
  {
    name: "Creatine Gummies",
    category: "Sports Nutrition — Creatine",
    description:
      `${DEMO_TAG} A creatine monohydrate gummy positioned against powder ` +
      `for people who dislike mixing drinks. Illustrative example only.`,
    source: "Manual entry (demo)",
    trendSignal: `${DEMO_TAG} Illustrative placeholder: "gummy format" search interest assumed rising.`,
    trendEvidence:
      `${DEMO_TAG} No real trend data source connected yet. This field will be populated ` +
      `by the Validator agent in Phase 2.`,
    scores: {
      trendVelocity: 7,
      creativePotential: 8,
      marginPotential: 6,
      marketDemand: 7,
      competition: 4,
      fulfillmentSimplicity: 7,
      repeatPurchase: 8,
      regulatoryRisk: 6,
      brandability: 7,
    },
    economics: {
      sellingPrice: 34.99,
      cogs: 6.5,
      shippingCost: 3.2,
      packagingCost: 0.9,
      paymentFeePct: 2.9,
      discountPct: 10,
      refundRatePct: 4,
    },
    status: "VALIDATING" as const,
  },
  {
    name: "Magnesium Recovery Complex",
    category: "Sports Nutrition — Recovery",
    description:
      `${DEMO_TAG} A multi-form magnesium blend targeted at sleep/recovery for ` +
      `active adults. Illustrative example only.`,
    source: "Manual entry (demo)",
    trendSignal: `${DEMO_TAG} Illustrative placeholder: "magnesium glycinate" assumed to have steady demand.`,
    trendEvidence:
      `${DEMO_TAG} No real trend data source connected yet. This field will be populated ` +
      `by the Validator agent in Phase 2.`,
    scores: {
      trendVelocity: 6,
      creativePotential: 6,
      marginPotential: 7,
      marketDemand: 6,
      competition: 3,
      fulfillmentSimplicity: 8,
      repeatPurchase: 8,
      regulatoryRisk: 7,
      brandability: 5,
    },
    economics: {
      sellingPrice: 29.99,
      cogs: 5.1,
      shippingCost: 3.0,
      packagingCost: 0.8,
      paymentFeePct: 2.9,
      discountPct: 10,
      refundRatePct: 5,
    },
    status: "DISCOVERED" as const,
  },
  {
    name: "Men's Performance Gummies",
    category: "Sports Nutrition — Multi-ingredient",
    description:
      `${DEMO_TAG} A men's daily-performance gummy stack (energy/focus/test-support ` +
      `adjacent claims TBD). Illustrative example only — ingredient claims not finalized.`,
    source: "Manual entry (demo)",
    trendSignal: `${DEMO_TAG} Illustrative placeholder: assumed adjacency to existing BULLRUSH audience.`,
    trendEvidence:
      `${DEMO_TAG} No real trend data source connected yet. This field will be populated ` +
      `by the Validator agent in Phase 2.`,
    scores: {
      trendVelocity: 5,
      creativePotential: 7,
      marginPotential: 5,
      marketDemand: 5,
      competition: 3,
      fulfillmentSimplicity: 6,
      repeatPurchase: 7,
      regulatoryRisk: 4,
      brandability: 8,
    },
    economics: {
      sellingPrice: 39.99,
      cogs: 8.2,
      shippingCost: 3.4,
      packagingCost: 1.1,
      paymentFeePct: 2.9,
      discountPct: 15,
      refundRatePct: 6,
    },
    status: "WATCH" as const,
  },
];

async function main() {
  console.log("Seeding demo data (clearly marked, non-production)...");

  for (const demo of demoOpportunities) {
    const overallScore = calculateOverallScore(demo.scores);
    const riskLevel = deriveRiskLevel(demo.scores);

    const existing = await prisma.productOpportunity.findFirst({
      where: { name: demo.name, isDemoData: true },
    });
    if (existing) {
      console.log(`  - Skipping "${demo.name}" (already seeded)`);
      continue;
    }

    await prisma.productOpportunity.create({
      data: {
        name: demo.name,
        category: demo.category,
        description: demo.description,
        source: demo.source,
        status: demo.status,
        isDemoData: true,
        trendSignal: demo.trendSignal,
        trendEvidence: demo.trendEvidence,
        scoreTrendVelocity: demo.scores.trendVelocity,
        scoreCreativePotential: demo.scores.creativePotential,
        scoreMarginPotential: demo.scores.marginPotential,
        scoreMarketDemand: demo.scores.marketDemand,
        scoreCompetition: demo.scores.competition,
        scoreFulfillmentSimplicity: demo.scores.fulfillmentSimplicity,
        scoreRepeatPurchase: demo.scores.repeatPurchase,
        scoreRegulatoryRisk: demo.scores.regulatoryRisk,
        scoreBrandability: demo.scores.brandability,
        overallScore,
        riskLevel,
        sellingPrice: demo.economics.sellingPrice,
        cogs: demo.economics.cogs,
        shippingCost: demo.economics.shippingCost,
        packagingCost: demo.economics.packagingCost,
        paymentFeePct: demo.economics.paymentFeePct,
        discountPct: demo.economics.discountPct,
        refundRatePct: demo.economics.refundRatePct,
      },
    });
    console.log(`  - Created "${demo.name}" (score ${overallScore}, risk ${riskLevel})`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
