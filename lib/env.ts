// Central place to check whether a Phase 2+ integration has credentials.
// Nothing in /agents or /services should ever fake a live integration —
// they check isConfigured() and return a NOT_CONFIGURED result instead.

export type ServiceKey =
  | "shopify"
  | "domains"
  | "suppliers"
  | "images"
  | "meta"
  | "tiktok";

const REQUIRED_VARS: Record<ServiceKey, string[]> = {
  shopify: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_API_ACCESS_TOKEN"],
  domains: ["DOMAIN_REGISTRAR_API_KEY"],
  suppliers: ["SUPPLIER_SOURCING_API_KEY"],
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
