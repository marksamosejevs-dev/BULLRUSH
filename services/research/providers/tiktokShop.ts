// TikTok Shop signals require TikTok Shop Partner/Seller API access,
// which is an approved-partner program (app review, region-scoped
// credentials) — not a self-serve key. Stays NOT_CONFIGURED until that
// partner access exists; no scraping of TikTok Shop or Creative Center.

import { DiscoveredProduct, ResearchProvider } from "../researchProvider";

export const tiktokShopProvider: ResearchProvider = {
  key: "TIKTOK_SHOP",
  label: "TikTok Shop",
  requirement:
    "Requires an approved TikTok Shop Partner/Seller API integration (TIKTOK_SHOP_APP_KEY, TIKTOK_SHOP_APP_SECRET, TIKTOK_SHOP_ACCESS_TOKEN) — not available in Phase 2.",

  isConfigured() {
    return Boolean(
      process.env.TIKTOK_SHOP_APP_KEY &&
        process.env.TIKTOK_SHOP_APP_SECRET &&
        process.env.TIKTOK_SHOP_ACCESS_TOKEN,
    );
  },

  async search(): Promise<DiscoveredProduct[]> {
    return [];
  },
};
