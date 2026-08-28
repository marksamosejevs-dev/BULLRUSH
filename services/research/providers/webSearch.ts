// Real web search via the Brave Search API (https://api.search.brave.com).
// Official, documented, key-based REST API — no scraping.
//
// Auth: header `X-Subscription-Token: <BRAVE_SEARCH_API_KEY>`
// Endpoint: GET https://api.search.brave.com/res/v1/web/search?q=...

import { DiscoveredProduct, ResearchProvider, ResearchProviderError } from "../researchProvider";

const ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

interface BraveWebResult {
  title: string;
  url: string;
  description?: string;
  age?: string; // human string like "3 days ago" — not a reliable timestamp
}

interface BraveSearchResponse {
  web?: { results?: BraveWebResult[] };
}

export const webSearchProvider: ResearchProvider = {
  key: "WEB_SEARCH",
  label: "Web Search (Brave)",
  requirement: "Set BRAVE_SEARCH_API_KEY (https://api.search.brave.com) in your environment.",

  isConfigured() {
    return Boolean(process.env.BRAVE_SEARCH_API_KEY);
  },

  async search(query: string): Promise<DiscoveredProduct[]> {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
      throw new ResearchProviderError("WEB_SEARCH", "BRAVE_SEARCH_API_KEY is not set");
    }

    const url = new URL(ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("country", "us");

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      });
    } catch (err) {
      throw new ResearchProviderError("WEB_SEARCH", `Network error calling Brave Search: ${String(err)}`);
    }

    if (!res.ok) {
      throw new ResearchProviderError(
        "WEB_SEARCH",
        `Brave Search returned ${res.status} ${res.statusText}: ${await safeText(res)}`,
      );
    }

    const data = (await res.json()) as BraveSearchResponse;
    const results = data.web?.results ?? [];
    const observedAt = new Date();

    // One search doesn't itself say "this product is accelerating" — it's
    // recorded as one qualitative signal per opportunity, and the Scout
    // decides on acceleration by looking at corroboration across sources.
    return results.map((result) => ({
      rawName: query,
      category: "Uncategorized",
      description: result.description ?? result.title,
      source: "Web Search (Brave)",
      sourceUrl: result.url,
      observedAt,
      confidence: 0.35, // a single web result is weak evidence on its own
      signals: [
        {
          label: "Web search result",
          description: `${result.title} — ${result.description ?? "no snippet"}`,
          metricValue: null,
          metricUnit: null,
          source: "Web Search (Brave)",
          url: result.url,
          observedAt,
          confidence: 0.35,
        },
      ],
    }));
  },
};

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<no body>";
  }
}
