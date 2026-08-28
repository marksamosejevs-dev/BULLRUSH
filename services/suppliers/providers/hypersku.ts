// HyperSKU offers an "Open API" for custom integrations, but publishes no
// self-serve public API reference we could ground an implementation in
// from this environment — access requires contacting their integration
// team directly. Rather than guess endpoint shapes or scrape their site,
// this stays an architecture placeholder until real, documented
// credentials/access exist (Part 7).

import {
  ShippingQuote,
  SupplierProductResult,
  SupplierProvider,
  SupplierProviderError,
  SupplierProviderStatus,
  SupplierVariant,
} from "../supplierProvider";

const PROVIDER_KEY = "HYPERSKU";

function isHyperskuConfigured(): boolean {
  return Boolean(process.env.HYPERSKU_API_KEY && process.env.HYPERSKU_API_BASE_URL);
}

function notConfigured(): never {
  throw new SupplierProviderError(
    PROVIDER_KEY,
    "HyperSKU has no publicly documented self-serve API in this environment. Contact HyperSKU's integration team for Open API access, then set HYPERSKU_API_KEY and HYPERSKU_API_BASE_URL.",
  );
}

export const hyperskuProvider: SupplierProvider = {
  key: PROVIDER_KEY,
  label: "HyperSKU",
  requirement: "Requires HyperSKU Open API access (contact their integration team) — not available in Phase 2.",

  isConfigured: isHyperskuConfigured,

  async status(): Promise<SupplierProviderStatus> {
    return isHyperskuConfigured() ? "ERROR" : "NOT_CONFIGURED";
  },

  async searchProducts(): Promise<SupplierProductResult[]> {
    notConfigured();
  },
  async getProduct(): Promise<SupplierProductResult | null> {
    notConfigured();
  },
  async getVariants(): Promise<SupplierVariant[]> {
    notConfigured();
  },
  async getInventory(): Promise<number | null> {
    notConfigured();
  },
  async getShippingQuote(): Promise<ShippingQuote | null> {
    notConfigured();
  },
  async getSupplierInfo() {
    return null;
  },
};
