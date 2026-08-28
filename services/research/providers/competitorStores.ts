// Reads the public, unauthenticated `/products.json` storefront feed that
// Shopify serves by default for most stores' active catalog. This is not a
// login-gated or private endpoint and is commonly used for public
// competitive research; it's still opt-in here — only stores the operator
// explicitly lists in COMPETITOR_STORE_DOMAINS are ever fetched, and only
// on demand (no polling/cron in Phase 2).

import { DiscoveredProduct, ResearchProvider, ResearchProviderError } from "../researchProvider";

interface ShopifyProduct {
  id: number;
  title: string;
  product_type?: string;
  vendor?: string;
  handle: string;
  published_at?: string;
  variants?: { price?: string }[];
}

interface ShopifyProductsResponse {
  products?: ShopifyProduct[];
}

function configuredDomains(): string[] {
  return (process.env.COMPETITOR_STORE_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
}

export const competitorStoresProvider: ResearchProvider = {
  key: "COMPETITOR_STORES",
  label: "Competitor Storefronts",
  requirement:
    "Set COMPETITOR_STORE_DOMAINS to a comma-separated list of public Shopify store domains to check (e.g. example.com,other-store.com).",

  isConfigured() {
    return configuredDomains().length > 0;
  },

  async search(query: string): Promise<DiscoveredProduct[]> {
    const domains = configuredDomains();
    if (domains.length === 0) {
      throw new ResearchProviderError("COMPETITOR_STORES", "COMPETITOR_STORE_DOMAINS is not set");
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: DiscoveredProduct[] = [];
    const observedAt = new Date();

    for (const domain of domains) {
      const url = `https://${domain}/products.json?limit=250`;
      // One unreachable competitor store shouldn't fail the whole search —
      // skip it and keep checking the rest of the configured domains.
      let res: Response;
      try {
        res = await fetch(url, { headers: { Accept: "application/json" } });
      } catch {
        continue;
      }

      if (!res.ok) {
        continue;
      }

      let data: ShopifyProductsResponse;
      try {
        data = (await res.json()) as ShopifyProductsResponse;
      } catch {
        // Not every domain in the list will actually be a Shopify store
        // exposing this feed — that's an expected, non-fatal outcome.
        continue;
      }

      const products = data.products ?? [];
      const matches = products.filter((p) =>
        queryTerms.every((term) => p.title.toLowerCase().includes(term)),
      );

      for (const product of matches.slice(0, 5)) {
        const price = product.variants?.[0]?.price;
        results.push({
          rawName: product.title,
          category: product.product_type || "Uncategorized",
          description: `Listed on ${domain}${product.vendor ? ` by ${product.vendor}` : ""}${
            price ? ` at $${price}` : ""
          }.`,
          source: "Competitor Storefronts",
          sourceUrl: `https://${domain}/products/${product.handle}`,
          observedAt,
          confidence: 0.5,
          signals: [
            {
              label: "Listed on competitor storefront",
              description: `"${product.title}" is listed on the public ${domain} storefront${
                product.published_at ? `, published ${product.published_at}` : ""
              }.`,
              metricValue: price ? Number(price) : null,
              metricUnit: price ? "USD" : null,
              source: "Competitor Storefronts",
              url: `https://${domain}/products/${product.handle}`,
              observedAt,
              confidence: 0.5,
            },
          ],
        });
      }
    }

    return results;
  },
};
