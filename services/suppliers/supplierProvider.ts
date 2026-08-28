// Common interface every sourcing provider implements (Part 4).
//
// Everything here is read-only research: searching, quoting, checking
// inventory/shipping. Order placement is intentionally NOT part of this
// interface yet — see the comment at the bottom.

export interface SupplierVariant {
  externalVariantId: string;
  name: string;
  unitCost: number | null;
  currency: string;
  inventory: number | null; // null = unknown, never guessed
  attributes?: Record<string, string>;
}

export interface SupplierProductResult {
  providerKey: string;
  externalProductId: string;
  title: string;
  description?: string;
  productUrl?: string;
  imageUrl?: string;
  category?: string;
  variants: SupplierVariant[];
  moq: number | null;
  warehouses: string[];
  rating?: number | null;
  ordersCount?: number | null;
  /** How complete/trustworthy this result's data is, 0-1. */
  confidence: number;
  raw?: unknown;
}

export interface ShippingQuote {
  providerKey: string;
  externalProductId: string;
  externalVariantId?: string;
  destinationCountry: string;
  destinationPostalCode?: string;
  unitCost: number | null;
  shippingCost: number | null;
  currency: string;
  shippingMethod: string | null;
  estimatedDeliveryDaysMin: number | null;
  estimatedDeliveryDaysMax: number | null;
  warehouse: string | null;
  quoteDate: Date;
  raw?: unknown;
}

export type SupplierProviderStatus = "CONNECTED" | "NOT_CONFIGURED" | "ERROR";

export interface SupplierProvider {
  key: string; // "CJ" | "ZENDROP" | "HYPERSKU" | "ALIEXPRESS"
  label: string;
  requirement: string;
  isConfigured(): boolean;
  /** Cheap reachability check — does not have to hit every endpoint. */
  status(): Promise<SupplierProviderStatus>;
  searchProducts(query: string): Promise<SupplierProductResult[]>;
  getProduct(externalProductId: string): Promise<SupplierProductResult | null>;
  getVariants(externalProductId: string): Promise<SupplierVariant[]>;
  getInventory(externalProductId: string, externalVariantId?: string): Promise<number | null>;
  getShippingQuote(input: {
    externalProductId: string;
    externalVariantId?: string;
    destinationCountry: string;
    destinationPostalCode?: string;
    quantity?: number;
  }): Promise<ShippingQuote | null>;
  getSupplierInfo(): Promise<{ name: string; platform: string; ratingSummary?: string } | null>;
}

export class SupplierProviderError extends Error {
  constructor(
    public providerKey: string,
    message: string,
  ) {
    super(message);
    this.name = "SupplierProviderError";
  }
}

// Future methods (Phase 3+, NOT implemented here on purpose — Part 18):
//   createOrder(input): Promise<Order>
//   getOrder(orderId): Promise<Order>
//   getTracking(orderId): Promise<TrackingInfo>
// These require real paid-order authorization flows and stay out of scope
// until domain purchasing / Shopify publishing / paid ordering are in
// scope for a later phase.
