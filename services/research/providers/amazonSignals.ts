// Amazon's Product Advertising API (PA-API) requires an active Amazon
// Associates account with qualifying sales history before AWS-style
// signed credentials are issued — there is no way to get real access in
// a fresh environment. Stays NOT_CONFIGURED; no unofficial scraping of
// Amazon search/category pages.

import { DiscoveredProduct, ResearchProvider } from "../researchProvider";

export const amazonSignalsProvider: ResearchProvider = {
  key: "AMAZON_SIGNALS",
  label: "Amazon Marketplace",
  requirement:
    "Requires an Amazon Associates account with PA-API access (AMAZON_PAAPI_ACCESS_KEY, AMAZON_PAAPI_SECRET_KEY, AMAZON_PAAPI_PARTNER_TAG) — not available in Phase 2.",

  isConfigured() {
    return Boolean(
      process.env.AMAZON_PAAPI_ACCESS_KEY &&
        process.env.AMAZON_PAAPI_SECRET_KEY &&
        process.env.AMAZON_PAAPI_PARTNER_TAG,
    );
  },

  async search(): Promise<DiscoveredProduct[]> {
    return [];
  },
};
