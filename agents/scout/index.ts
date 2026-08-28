// Scout agent (Part 1). Searches every configured research provider for a
// given query, normalizes and merges the results (Part 2), and writes real
// ProductOpportunity + TrendEvidence rows — never fabricated ones. Then
// hands each opportunity to the Validator so scores reflect the evidence
// just collected.
//
// V1 is query-directed, not autonomous: an admin supplies the search term
// from the dashboard. Autonomous, unattended trend scanning across
// categories is Phase 3 work — see docs/NEXT_STEPS.md.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CONFIG } from "@/lib/config";
import { normalizeProductName } from "@/lib/normalize";
import { calculateOverallScore, deriveRiskLevel, ScoringInput } from "@/lib/scoring";
import {
  DiscoveredProduct,
  ResearchProviderError,
  TrendSignal,
} from "@/services/research/researchProvider";
import { RESEARCH_PROVIDERS } from "@/services/research/registry";
import { runValidator } from "@/agents/validator";

export interface ScoutProviderResult {
  providerKey: string;
  label: string;
  status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR";
  itemsFound: number;
  error?: string;
}

export interface ScoutRunResult {
  jobRunId: string;
  query: string;
  createdOpportunityIds: string[];
  updatedOpportunityIds: string[];
  providerResults: ScoutProviderResult[];
  summary: string;
}

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

export async function runScout(query: string): Promise<ScoutRunResult> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error("Scout query is required");

  const startedAt = new Date();
  const jobRun = await prisma.jobRun.create({
    data: { agent: "SCOUT_PRODUCTS", status: "RUNNING", startedAt, input: { query: trimmed } },
  });

  const providerResults: ScoutProviderResult[] = [];
  const discovered: DiscoveredProduct[] = [];

  for (const provider of RESEARCH_PROVIDERS) {
    if (!provider.isConfigured()) {
      providerResults.push({
        providerKey: provider.key,
        label: provider.label,
        status: "NOT_CONFIGURED",
        itemsFound: 0,
      });
      continue;
    }
    try {
      const results = await provider.search(trimmed);
      discovered.push(...results);
      providerResults.push({
        providerKey: provider.key,
        label: provider.label,
        status: "CONNECTED",
        itemsFound: results.length,
      });
    } catch (err) {
      const message = err instanceof ResearchProviderError ? err.message : String(err);
      providerResults.push({
        providerKey: provider.key,
        label: provider.label,
        status: "ERROR",
        itemsFound: 0,
        error: message,
      });
    }
  }

  const groups = groupByNormalizedName(discovered);
  const createdOpportunityIds: string[] = [];
  const updatedOpportunityIds: string[] = [];

  for (const [normalizedName, items] of groups) {
    const rawNames = Array.from(new Set(items.map((i) => i.rawName)));
    const sources = Array.from(new Set(items.map((i) => i.source)));
    const category = items.find((i) => i.category && i.category !== "Uncategorized")?.category ?? "Uncategorized";
    const description = items.map((i) => i.description).filter(Boolean).slice(0, 3).join(" ") ||
      `Discovered via ${sources.join(", ")}.`;
    const sourceUrl = items.find((i) => i.sourceUrl)?.sourceUrl ?? null;
    const timestamps = items.map((i) => i.observedAt.getTime());
    const firstSeenAt = new Date(Math.min(...timestamps));
    const lastSeenAt = new Date(Math.max(...timestamps));
    // Corroboration across independent sources raises confidence; a single
    // source's own confidence is the floor.
    const confidence = Math.min(0.95, Math.max(...items.map((i) => i.confidence)) + (sources.length - 1) * 0.1);
    const signals = items.flatMap((i) => i.signals);
    const trendSignal = `${sources.length} source(s) — ${sources.join(", ")} — ${signals.length} data point(s).`;

    const existing = await prisma.productOpportunity.findFirst({
      where: { normalizedName, market: CONFIG.market, isDemoData: false },
    });

    if (existing) {
      await prisma.productOpportunity.update({
        where: { id: existing.id },
        data: {
          aliases: Array.from(new Set([...existing.aliases, ...rawNames])),
          lastSeenAt,
          confidence: Math.max(existing.confidence ?? 0, confidence),
          trendSignal,
          trendEvidenceItems: { create: signals.map(toEvidenceCreateInput) },
        },
      });
      updatedOpportunityIds.push(existing.id);
      await runValidator(existing.id);
      continue;
    }

    const overallScore = calculateOverallScore(NEUTRAL_SCORES);
    const riskLevel = deriveRiskLevel(NEUTRAL_SCORES);

    const created = await prisma.productOpportunity.create({
      data: {
        name: normalizedName,
        category,
        description,
        source: sources.join(", "),
        sourceUrl,
        status: "DISCOVERED",
        isDemoData: false,
        market: CONFIG.market,
        normalizedName,
        aliases: rawNames,
        firstSeenAt,
        lastSeenAt,
        confidence,
        trendSignal,
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
        // Economics are unknown until Sourcing runs (Part 4-11) —
        // deliberately left at zero rather than guessed.
        sellingPrice: 0,
        cogs: 0,
        shippingCost: 0,
        trendEvidenceItems: { create: signals.map(toEvidenceCreateInput) },
      },
    });
    createdOpportunityIds.push(created.id);
    await runValidator(created.id);
  }

  const connectedCount = providerResults.filter((p) => p.status === "CONNECTED").length;
  const allNotConfigured = providerResults.every((p) => p.status === "NOT_CONFIGURED");
  const summary = allNotConfigured
    ? `No research providers are configured — nothing was searched. Configure at least one (see .env.example) to run a real Scout search.`
    : `Query "${trimmed}": ${discovered.length} raw result(s) from ${connectedCount} connected provider(s) -> ${createdOpportunityIds.length} new opportunity(ies), ${updatedOpportunityIds.length} updated.`;

  await prisma.jobRun.update({
    where: { id: jobRun.id },
    data: {
      status: allNotConfigured ? "NOT_CONFIGURED" : "SUCCEEDED",
      finishedAt: new Date(),
      itemsProcessed: discovered.length,
      output: { providerResults, createdOpportunityIds, updatedOpportunityIds } as unknown as Prisma.InputJsonValue,
      summary,
    },
  });

  return { jobRunId: jobRun.id, query: trimmed, createdOpportunityIds, updatedOpportunityIds, providerResults, summary };
}

function groupByNormalizedName(items: DiscoveredProduct[]): Map<string, DiscoveredProduct[]> {
  const groups = new Map<string, DiscoveredProduct[]>();
  for (const item of items) {
    if (!item.rawName || item.confidence <= 0) continue;
    const key = normalizeProductName(item.rawName);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
}

function toEvidenceCreateInput(signal: TrendSignal) {
  return {
    label: signal.label,
    description: signal.description,
    metricValue: signal.metricValue,
    metricUnit: signal.metricUnit,
    source: signal.source,
    url: signal.url,
    observedAt: signal.observedAt,
    confidence: signal.confidence,
  };
}
