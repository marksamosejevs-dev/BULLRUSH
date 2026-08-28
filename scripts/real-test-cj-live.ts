// Live sanity check for the CJ Dropshipping provider (Part 17 / Part 19
// QA). Run this from an environment with normal outbound internet access
// (this repo's own dev sandbox may not have one — see README's "One real
// supplier result").
//
//   cp .env.example .env   # then set CJ_API_KEY or CJ_ACCESS_TOKEN
//   npx tsx scripts/real-test-cj-live.ts [search query]
//
// Safe to re-run any time — read-only (search, product detail, variants,
// shipping quote). Never places an order.

import "dotenv/config";
import { cjProvider } from "../services/suppliers/providers/cj";

async function main() {
  const query = process.argv[2] ?? "creatine gummies";

  console.log("isConfigured:", cjProvider.isConfigured());
  if (!cjProvider.isConfigured()) {
    console.log("Set CJ_API_KEY or CJ_ACCESS_TOKEN in .env and re-run.");
    return;
  }

  console.log("status():", await cjProvider.status());

  console.log(`\nSearching CJ for "${query}"...`);
  const results = await cjProvider.searchProducts(query);
  console.log(`Found ${results.length} product(s).`);
  for (const r of results.slice(0, 5)) {
    console.log("-", r.title, "| pid:", r.externalProductId, "| unitCost:", r.variants[0]?.unitCost ?? "unknown");
  }

  const first = results[0];
  if (!first) return;

  console.log(`\nFetching variants for "${first.title}"...`);
  const variants = await cjProvider.getVariants(first.externalProductId);
  console.log(`Found ${variants.length} variant(s).`, variants.slice(0, 3));

  const variant = variants[0];
  if (!variant) return;

  console.log("\nRequesting a real US shipping quote...");
  const quote = await cjProvider.getShippingQuote({
    externalProductId: first.externalProductId,
    externalVariantId: variant.externalVariantId,
    destinationCountry: "US",
    destinationPostalCode: process.env.DEFAULT_VALIDATION_POSTAL_CODE || "90210",
  });
  console.log("Shipping quote:", quote);

  if (quote && variant.unitCost !== null && quote.shippingCost !== null) {
    console.log(`\nReal landed cost: $${(variant.unitCost + quote.shippingCost).toFixed(2)}`);
  }
}

main().catch((err) => {
  console.error("ERROR:", err instanceof Error ? err.message : err);
  process.exit(1);
});
