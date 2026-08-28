import { ResearchProvider } from "./researchProvider";
import { webSearchProvider } from "./providers/webSearch";
import { metaAdLibraryProvider } from "./providers/metaAdLibrary";
import { competitorStoresProvider } from "./providers/competitorStores";
import { googleTrendsProvider } from "./providers/googleTrends";
import { tiktokShopProvider } from "./providers/tiktokShop";
import { amazonSignalsProvider } from "./providers/amazonSignals";

export const RESEARCH_PROVIDERS: ResearchProvider[] = [
  webSearchProvider,
  metaAdLibraryProvider,
  competitorStoresProvider,
  googleTrendsProvider,
  tiktokShopProvider,
  amazonSignalsProvider,
];

export function getConfiguredResearchProviders(): ResearchProvider[] {
  return RESEARCH_PROVIDERS.filter((p) => p.isConfigured());
}
