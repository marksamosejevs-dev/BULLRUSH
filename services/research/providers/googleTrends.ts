// Google does not offer a documented, self-serve public API for search
// interest data — the only programmatic access is an experimental/limited
// Trends API currently gated behind a Google-approved allowlist, and the
// widely-used "unofficial" client libraries hit an undocumented internal
// endpoint, which is exactly the brittle/unsupported scraping this project
// avoids. This stays NOT_CONFIGURED until Google ships (or approves access
// to) an official API for this use case.

import { DiscoveredProduct, ResearchProvider } from "../researchProvider";

export const googleTrendsProvider: ResearchProvider = {
  key: "GOOGLE_TRENDS",
  label: "Google Trends",
  requirement:
    "No self-serve official API exists for this yet. Requires Google's allowlisted Trends API access — not available in Phase 2.",

  isConfigured() {
    return false;
  },

  async search(): Promise<DiscoveredProduct[]> {
    return [];
  },
};
