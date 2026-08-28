// Real access to Meta's official public Ad Library API (Graph API
// `ads_archive` node). No scraping — this is Meta's own documented,
// publicly-searchable ad transparency endpoint.
//
// Auth: query param `access_token` (a Graph API user/app access token).
// Endpoint: GET https://graph.facebook.com/v23.0/ads_archive
//   ?search_terms=...&ad_reached_countries=["US"]&access_token=...
//
// Signal: number of distinct active advertisers currently running ads for
// the search term is a real, direct proxy for "new advertisers" / "creative
// replication" acceleration signals the brief asks for.

import { DiscoveredProduct, ResearchProvider, ResearchProviderError } from "../researchProvider";

const ENDPOINT = "https://graph.facebook.com/v23.0/ads_archive";

interface MetaAd {
  id: string;
  page_name?: string;
  page_id?: string;
  ad_creation_time?: string;
  ad_delivery_start_time?: string;
  ad_snapshot_url?: string;
}

interface MetaAdsArchiveResponse {
  data?: MetaAd[];
  error?: { message: string; type?: string; code?: number };
}

export const metaAdLibraryProvider: ResearchProvider = {
  key: "META_AD_LIBRARY",
  label: "Meta Ad Library",
  requirement:
    "Set META_AD_LIBRARY_ACCESS_TOKEN (a Graph API access token with Ad Library access) in your environment.",

  isConfigured() {
    return Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN);
  },

  async search(query: string): Promise<DiscoveredProduct[]> {
    const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN;
    if (!token) {
      throw new ResearchProviderError("META_AD_LIBRARY", "META_AD_LIBRARY_ACCESS_TOKEN is not set");
    }

    const url = new URL(ENDPOINT);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("ad_reached_countries", JSON.stringify(["US"]));
    url.searchParams.set("ad_active_status", "ACTIVE");
    url.searchParams.set(
      "fields",
      "id,page_name,page_id,ad_creation_time,ad_delivery_start_time,ad_snapshot_url",
    );
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", token);

    let res: Response;
    try {
      res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    } catch (err) {
      throw new ResearchProviderError("META_AD_LIBRARY", `Network error calling Meta Ad Library: ${String(err)}`);
    }

    let data: MetaAdsArchiveResponse;
    try {
      data = (await res.json()) as MetaAdsArchiveResponse;
    } catch {
      throw new ResearchProviderError(
        "META_AD_LIBRARY",
        `Meta Ad Library returned ${res.status} with a non-JSON body (not the Graph API — check network access to graph.facebook.com)`,
      );
    }

    if (!res.ok || data.error) {
      throw new ResearchProviderError(
        "META_AD_LIBRARY",
        `Meta Ad Library returned ${res.status}: ${data.error?.message ?? res.statusText}`,
      );
    }

    const ads = data.data ?? [];
    const advertisers = new Set(ads.map((ad) => ad.page_name).filter(Boolean));
    const observedAt = new Date();

    if (ads.length === 0) {
      return [];
    }

    // One DiscoveredProduct per query, carrying the real ad-volume metric
    // and one signal per distinct advertiser (capped) so evidence stays
    // traceable to an actual ad snapshot.
    const signals: DiscoveredProduct["signals"] = Array.from(advertisers)
      .slice(0, 10)
      .map((advertiser) => {
        const example = ads.find((ad) => ad.page_name === advertiser);
        return {
          label: "Active Meta advertiser",
          description: `"${advertiser}" is currently running an active ad matching "${query}".`,
          metricValue: null,
          metricUnit: null,
          source: "Meta Ad Library",
          url: example?.ad_snapshot_url ?? null,
          observedAt,
          confidence: 0.6,
        };
      });

    signals.unshift({
      label: "Active advertisers (Meta Ad Library)",
      description: `${advertisers.size} distinct advertiser(s) currently running active ads matching "${query}", across ${ads.length} ad(s) returned.`,
      metricValue: advertisers.size,
      metricUnit: "advertisers",
      source: "Meta Ad Library",
      url: null,
      observedAt,
      confidence: 0.7,
    });

    // Confidence scales with how many distinct advertisers are found —
    // one advertiser running ads is weak evidence of a trend, several is
    // a real "multiple brands launching similar products" signal.
    const confidence = Math.min(0.9, 0.3 + advertisers.size * 0.1);

    return [
      {
        rawName: query,
        category: "Uncategorized",
        description: `${advertisers.size} advertiser(s) actively running Meta ads matching "${query}".`,
        source: "Meta Ad Library",
        sourceUrl: `https://www.facebook.com/ads/library/?q=${encodeURIComponent(query)}&ad_reached_countries=US`,
        observedAt,
        confidence,
        signals,
      },
    ];
  },
};
