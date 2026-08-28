// Central place to check whether a Phase 2+ integration has credentials.
// Nothing in /agents or /services should ever fake a live integration —
// they check isConfigured() and return a NOT_CONFIGURED result instead.
//
// Supplier providers (CJ/Zendrop/HyperSKU/AliExpress) and research
// providers (Brave/Meta Ad Library/competitor storefronts) each check
// their own specific env vars directly — see services/suppliers/providers
// and services/research/providers. This file only covers the services
// still unimplemented from Phase 1 (shopify/domains/images) plus the ad
// platforms that stay out of scope through Phase 2 (meta/tiktok).

export type ServiceKey = "shopify" | "domains" | "images" | "meta" | "tiktok";

const REQUIRED_VARS: Record<ServiceKey, string[]> = {
  shopify: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_API_ACCESS_TOKEN"],
  domains: ["DOMAIN_REGISTRAR_API_KEY"],
  images: ["IMAGE_GENERATION_API_KEY"],
  meta: ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"],
  tiktok: ["TIKTOK_ACCESS_TOKEN", "TIKTOK_ADVERTISER_ID"],
};

export function isConfigured(service: ServiceKey): boolean {
  return REQUIRED_VARS[service].every((name) => Boolean(process.env[name]));
}

export function missingVars(service: ServiceKey): string[] {
  return REQUIRED_VARS[service].filter((name) => !process.env[name]);
}
