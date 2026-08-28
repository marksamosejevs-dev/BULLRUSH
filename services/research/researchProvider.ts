// Common interface every Scout research source implements (Part 1).
//
// A provider either returns real, sourced data, or it doesn't run at all —
// there is no "plausible fake" middle ground. `isConfigured()` gates
// whether `search()` is ever called.

export interface TrendSignal {
  label: string;
  description: string;
  metricValue: number | null; // a real number if the source returned one
  metricUnit: string | null;
  source: string;
  url: string | null;
  observedAt: Date;
  confidence: number; // 0-1
}

export interface DiscoveredProduct {
  /** Raw name exactly as this source described it — never rewritten. */
  rawName: string;
  category: string;
  description: string;
  source: string;
  sourceUrl: string | null;
  signals: TrendSignal[];
  observedAt: Date;
  /** This source's own confidence in the discovery, 0-1. */
  confidence: number;
}

export type ResearchProviderStatus = "CONNECTED" | "NOT_CONFIGURED" | "ERROR";

export interface ResearchProvider {
  key: string;
  label: string;
  /** One line explaining what's needed to turn this on, for the UI. */
  requirement: string;
  isConfigured(): boolean;
  search(query: string): Promise<DiscoveredProduct[]>;
}

export class ResearchProviderError extends Error {
  constructor(
    public providerKey: string,
    message: string,
  ) {
    super(message);
    this.name = "ResearchProviderError";
  }
}
