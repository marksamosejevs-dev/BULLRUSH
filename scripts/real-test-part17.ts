// One-off script for the Part 17 "first real test" — NOT part of the app.
// Creates ONE real (isDemoData: false) ProductOpportunity for "Portable
// mini thermal printer" using real evidence gathered via web research in
// this session (real URLs, dated today), then runs the real Validator
// against it. This stands in for a live Scout run because no research
// provider has credentials configured in this environment (see the final
// report) — the evidence below is genuinely real, just gathered by hand
// instead of by an automated, key-authenticated provider call.
//
// Run once: npx tsx scripts/real-test-part17.ts
// Safe to delete after review — this is not imported by the app.

import { prisma } from "../lib/prisma";
import { calculateOverallScore, deriveRiskLevel, ScoringInput } from "../lib/scoring";
import { runValidator } from "../agents/validator";

const NEUTRAL_SCORES: ScoringInput = {
  trendVelocity: 5,
  creativePotential: 5,
  marginPotential: 5,
  marketDemand: 5,
  competition: 5,
  fulfillmentSimplicity: 5,
  repeatPurchase: 5,
  regulatoryRisk: 5,
  brandability: 5,
};

async function main() {
  const overallScore = calculateOverallScore(NEUTRAL_SCORES);
  const riskLevel = deriveRiskLevel(NEUTRAL_SCORES);

  const opportunity = await prisma.productOpportunity.create({
    data: {
      name: "Portable Mini Thermal Printer",
      category: "Electronics — Portable Printing",
      description:
        "A Bluetooth-connected, inkless portable thermal printer used for shipping labels, receipts, and " +
        "photo/label printing by micro-merchants and e-commerce resellers.",
      source: "Manual web research (real, gathered this session — no research provider API key is configured; see docs/NEXT_STEPS.md)",
      sourceUrl: "https://www.tiktok.com/discover/mini-printer-for-dropshipping",
      status: "DISCOVERED",
      isDemoData: false,
      market: "US",
      normalizedName: "Portable Mini Thermal Printer",
      aliases: ["Portable mini thermal printer", "Bluetooth mini thermal printer", "Mini printer for dropshipping"],
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      confidence: 0.4, // single manual research pass, not corroborated by an automated provider
      riskCategory: "STANDARD",
      trendSignal: "Manually researched — real sources found, not from an automated/authenticated provider run.",
      scoreTrendVelocity: NEUTRAL_SCORES.trendVelocity,
      scoreCreativePotential: NEUTRAL_SCORES.creativePotential,
      scoreMarginPotential: NEUTRAL_SCORES.marginPotential,
      scoreMarketDemand: NEUTRAL_SCORES.marketDemand,
      scoreCompetition: NEUTRAL_SCORES.competition,
      scoreFulfillmentSimplicity: NEUTRAL_SCORES.fulfillmentSimplicity,
      scoreRepeatPurchase: NEUTRAL_SCORES.repeatPurchase,
      scoreRegulatoryRisk: NEUTRAL_SCORES.regulatoryRisk,
      scoreBrandability: NEUTRAL_SCORES.brandability,
      overallScore,
      riskLevel,
      sellingPrice: 0,
      cogs: 0,
      shippingCost: 0,
      trendEvidenceItems: {
        create: [
          {
            label: "Dropshipping vertical, TikTok discovery",
            description:
              "TikTok's own discovery/hashtag page for \"mini printer for dropshipping\" is active, indicating " +
              "ongoing creator content volume around this product category as a dropshipping vertical.",
            metricValue: null,
            metricUnit: null,
            source: "Web Search (manual)",
            url: "https://www.tiktok.com/discover/mini-printer-for-dropshipping",
            observedAt: new Date(),
            confidence: 0.35,
          },
          {
            label: "Multiple dropshipping-supplier listings",
            description:
              "Multiple B2B sourcing/dropshipping directories (Alibaba electronics category, Doba) carry live " +
              "\"portable/mini thermal printer\" listings and buying guides framed specifically for the " +
              "dropshipping/reseller channel, indicating existing supplier-side interest in this category.",
            metricValue: null,
            metricUnit: null,
            source: "Web Search (manual)",
            url: "https://www.doba.com/dropshipping/thermal-printer.html",
            observedAt: new Date(),
            confidence: 0.3,
          },
          {
            label: "Category growth claim (unverified marketing content)",
            description:
              "A buying-guide page claims mid-single-digit-percent CAGR growth for thermal printers broadly and " +
              "double-digit CAGR specifically for Bluetooth thermal printers through the early 2030s. This is " +
              "marketing/SEO content, not a primary market-research source — recorded as low-confidence " +
              "qualitative evidence only, no numeric figure is treated as a verified metric.",
            metricValue: null,
            metricUnit: null,
            source: "Web Search (manual) — unverified marketing content",
            url: "https://electronics.alibaba.com/buyingguides/portable-printer-dropshipping-guide",
            observedAt: new Date(),
            confidence: 0.15,
          },
        ],
      },
    },
  });

  console.log(`Created real opportunity: ${opportunity.id} (${opportunity.name})`);

  const result = await runValidator(opportunity.id);
  console.log("Validator result:", result);

  const updated = await prisma.productOpportunity.findUniqueOrThrow({ where: { id: opportunity.id } });
  console.log(`Overall score: ${updated.overallScore}/10 -> ${updated.recommendedAction} (${updated.recommendedActionReason})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
