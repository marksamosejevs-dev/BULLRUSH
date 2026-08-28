// AliExpress's official Open Platform Dropshipping/Affiliate API requires
// an approved developer application (app key + app secret, signed
// requests) — approval takes days and is a business decision, not
// something this environment can obtain or fake. Stays an architecture
// placeholder until approved credentials exist (Part 8). No scraping.

import {
  ShippingQuote,
  SupplierProductResult,
  SupplierProvider,
  SupplierProviderError,
  SupplierProviderStatus,
  SupplierVariant,
} from "../supplierProvider";

const PROVIDER_KEY = "ALIEXPRESS";

function isAliexpressConfigured(): boolean {
  return Boolean(
    process.env.ALIEXPRESS_APP_KEY && process.env.ALIEXPRESS_APP_SECRET && process.env.ALIEXPRESS_ACCESS_TOKEN,
  );
}

function notConfigured(): never {
  throw new SupplierProviderError(
    PROVIDER_KEY,
    "AliExpress requires an approved Open Platform Dropshipping/Affiliate API application. Apply at openservice.aliexpress.com, then set ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ALIEXPRESS_ACCESS_TOKEN.",
  );
}

export const aliexpressProvider: SupplierProvider = {
  key: PROVIDER_KEY,
  label: "AliExpress",
  requirement:
    "Requires an approved AliExpress Open Platform application (ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ALIEXPRESS_ACCESS_TOKEN) — not available in Phase 2.",

  isConfigured: isAliexpressConfigured,

  async status(): Promise<SupplierProviderStatus> {
    return isAliexpressConfigured() ? "ERROR" : "NOT_CONFIGURED";
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
