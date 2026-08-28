// Sourcing agent (Parts 4, 9, 10). "Find Suppliers" on an opportunity:
// searches every configured supplier provider, filters out obviously
// unrelated results, requests a real US shipping quote for each surviving
// candidate, scores them (lib/matching.ts), and persists everything as
// SupplierQuote rows. Never places an order — see Part 18.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CONFIG } from "@/lib/config";
import { tokenize, isObviouslyUnrelated, scoreSupplierCandidate } from "@/lib/matching";
import { canTransition, OpportunityStatus } from "@/lib/state-machine";
import { SUPPLIER_PROVIDERS } from "@/services/suppliers/registry";
import { SupplierProductResult, SupplierProviderError } from "@/services/suppliers/supplierProvider";

const MAX_CANDIDATES_SCORED = 10;

export interface SourcingProviderResult {
  providerKey: string;
  label: string;
  status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR";
  itemsFound: number;
  error?: string;
}

export interface SourcingRunResult {
  jobRunId: string;
  opportunityId: string;
  queries: string[];
  providerResults: SourcingProviderResult[];
  quotesCreated: number;
  bestQuoteId: string | null;
  summary: string;
}

export async function runSourcing(opportunityId: string): Promise<SourcingRunResult> {
  const opportunity = await prisma.productOpportunity.findUniqueOrThrow({ where: { id: opportunityId } });

  const startedAt = new Date();
  const jobRun = await prisma.jobRun.create({
    data: { opportunityId, agent: "SOURCE_PRODUCT", status: "RUNNING", startedAt, input: { opportunityId } },
  });

  try {
    // Real query variants from real data already on file — the opportunity
    // name, its normalized form, and any aliases seen by the Scout — never
    // synthetic keyword templates.
    const queries = Array.from(
      new Set([opportunity.name, opportunity.normalizedName, ...opportunity.aliases].filter(Boolean) as string[]),
    ).slice(0, 4);

    const queryTokens = tokenize(opportunity.normalizedName || opportunity.name);
    const providerResults: SourcingProviderResult[] = [];
    const candidates: { providerKey: string; product: SupplierProductResult }[] = [];

    for (const provider of SUPPLIER_PROVIDERS) {
      if (!provider.isConfigured()) {
        providerResults.push({ providerKey: provider.key, label: provider.label, status: "NOT_CONFIGURED", itemsFound: 0 });
        continue;
      }
      let found = 0;
      let errored: string | undefined;
      for (const query of queries.slice(0, 2)) {
        try {
          const results = await provider.searchProducts(query);
          for (const product of results) {
            if (isObviouslyUnrelated(queryTokens, product.title)) continue;
            candidates.push({ providerKey: provider.key, product });
            found += 1;
          }
        } catch (err) {
          errored = err instanceof SupplierProviderError ? err.message : String(err);
        }
      }
      providerResults.push({
        providerKey: provider.key,
        label: provider.label,
        status: errored && found === 0 ? "ERROR" : "CONNECTED",
        itemsFound: found,
        error: errored,
      });
    }

    const toScore = candidates.slice(0, MAX_CANDIDATES_SCORED);
    const quoteIds: { id: string; totalScore: number; landedCost: number | null }[] = [];

    for (const { providerKey, product } of toScore) {
      const variant = product.variants[0];
      const provider = SUPPLIER_PROVIDERS.find((p) => p.key === providerKey)!;

      let shippingQuote = null;
      try {
        shippingQuote = await provider.getShippingQuote({
          externalProductId: product.externalProductId,
          externalVariantId: variant?.externalVariantId,
          destinationCountry: CONFIG.validationCountry,
          destinationPostalCode: CONFIG.validationPostalCode,
        });
      } catch {
        // Missing shipping data lowers the score/confidence below — it
        // doesn't stop the candidate from being recorded.
      }

      const unitCost = variant?.unitCost ?? null;
      const shippingCost = shippingQuote?.shippingCost ?? null;
      const landedCost = unitCost !== null && shippingCost !== null ? unitCost + shippingCost : null;

      const breakdown = scoreSupplierCandidate({
        queryTokens,
        productTitle: product.title,
        providerKey,
        unitCost,
        shippingCost,
        estimatedDeliveryDaysMin: shippingQuote?.estimatedDeliveryDaysMin ?? null,
        estimatedDeliveryDaysMax: shippingQuote?.estimatedDeliveryDaysMax ?? null,
        moq: product.moq,
        rating: product.rating ?? null,
        productConfidence: product.confidence,
        hasShippingQuote: shippingQuote !== null,
      });

      const supplier = await findOrCreateProviderSupplier(providerKey, provider.label);

      const quote = await prisma.supplierQuote.create({
        data: {
          opportunityId,
          supplierId: supplier.id,
          providerKey,
          externalProductId: product.externalProductId,
          externalVariantId: variant?.externalVariantId,
          variantName: variant?.name,
          productUrl: product.productUrl,
          imageUrl: product.imageUrl,
          unitCost,
          usShippingCost: shippingCost,
          landedCost,
          shippingMethod: shippingQuote?.shippingMethod,
          warehouse: shippingQuote?.warehouse,
          quoteCurrency: shippingQuote?.currency ?? "USD",
          quoteDate: shippingQuote?.quoteDate,
          estimatedDeliveryDaysMin: shippingQuote?.estimatedDeliveryDaysMin,
          estimatedDeliveryDaysMax: shippingQuote?.estimatedDeliveryDaysMax,
          moq: product.moq,
          matchScore: breakdown.matchScore,
          usDeliveryScore: breakdown.usDeliveryScore,
          landedCostScore: breakdown.landedCostScore,
          reliabilityScore: breakdown.reliabilityScore,
          fulfillmentAutomationScore: breakdown.fulfillmentAutomationScore,
          privateLabelScore: breakdown.privateLabelScore,
          moqFlexibilityScore: breakdown.moqFlexibilityScore,
          dataConfidenceScore: breakdown.dataConfidenceScore,
          totalScore: breakdown.totalScore,
          confidence: breakdown.confidence,
          rawResponse: (product.raw ?? null) as Prisma.InputJsonValue,
        },
      });
      quoteIds.push({ id: quote.id, totalScore: breakdown.totalScore, landedCost });
    }

    // "Best for validation" (Part 13) — highest total score wins, ties
    // broken by lower landed cost. Cheapest alone never auto-wins.
    let bestQuoteId: string | null = null;
    if (quoteIds.length > 0) {
      const best = quoteIds.reduce((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore > a.totalScore ? b : a;
        if (a.landedCost === null) return b.landedCost === null ? a : b;
        if (b.landedCost === null) return a;
        return b.landedCost < a.landedCost ? b : a;
      });
      bestQuoteId = best.id;
      await prisma.supplierQuote.updateMany({ where: { opportunityId }, data: { isSystemRecommended: false } });
      await prisma.supplierQuote.update({ where: { id: best.id }, data: { isSystemRecommended: true } });
    }

    // Running sourcing is what moves an approved opportunity into the
    // SOURCING status — re-running it later (e.g. to refresh quotes) is a
    // no-op on status.
    if (canTransition(opportunity.status as OpportunityStatus, "SOURCING")) {
      await prisma.productOpportunity.update({ where: { id: opportunityId }, data: { status: "SOURCING" } });
    }

    const connectedCount = providerResults.filter((p) => p.status === "CONNECTED").length;
    const summary =
      connectedCount === 0
        ? "No supplier providers are configured — nothing was searched. Configure CJ, Zendrop, HyperSKU or AliExpress credentials to source real candidates."
        : `${candidates.length} candidate(s) found from ${connectedCount} connected provider(s), ${quoteIds.length} scored and saved.`;

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: connectedCount === 0 ? "NOT_CONFIGURED" : "SUCCEEDED",
        finishedAt: new Date(),
        itemsProcessed: quoteIds.length,
        provider: providerResults.map((p) => p.providerKey).join(","),
        output: { providerResults, quoteIds: quoteIds.map((q) => q.id) } as unknown as Prisma.InputJsonValue,
        summary,
      },
    });

    return { jobRunId: jobRun.id, opportunityId, queries, providerResults, quotesCreated: quoteIds.length, bestQuoteId, summary };
  } catch (err) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: { status: "FAILED", finishedAt: new Date(), errorMessage: String(err instanceof Error ? err.message : err) },
    });
    throw err;
  }
}

async function findOrCreateProviderSupplier(providerKey: string, label: string) {
  const existing = await prisma.supplier.findFirst({ where: { name: label, platform: providerKey } });
  if (existing) return existing;
  return prisma.supplier.create({
    data: { name: label, platform: providerKey, shopifyIntegration: false, status: "UNVERIFIED" },
  });
}
