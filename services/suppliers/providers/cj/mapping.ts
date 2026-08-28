// Defensive mapping from CJ's documented response fields to our common
// SupplierProductResult/SupplierVariant/ShippingQuote shapes. Every field
// read here is optional-chained with a fallback — if CJ's actual response
// differs slightly from what's documented, this degrades to nulls (visible
// as "UNKNOWN" in the UI) rather than throwing or fabricating a number.

import { ShippingQuote, SupplierProductResult, SupplierVariant } from "../../supplierProvider";

export interface CjProductListItem {
  pid: string;
  productName?: string;
  productNameEn?: string;
  productSku?: string;
  productImage?: string;
  productWeight?: string;
  sellPrice?: string | number;
  categoryId?: string;
  categoryName?: string;
}

export interface CjProductDetail extends CjProductListItem {
  productUrl?: string;
  description?: string;
  packingWeight?: string;
}

export interface CjInventoryEntry {
  countryCode?: string;
  storageNum?: number;
  totalInventory?: number;
  cjInventory?: number;
  factoryInventory?: number;
}

export interface CjVariant {
  vid: string;
  variantSku?: string;
  variantNameEn?: string;
  variantSellPrice?: string | number;
  variantImage?: string;
  inventories?: CjInventoryEntry[];
  inventory?: number;
}

export interface CjFreightOption {
  logisticName?: string;
  logisticPrice?: string | number;
  logisticAging?: string; // e.g. "7-12"
  currency?: string;
}

export function mapCjProduct(
  item: CjProductListItem | CjProductDetail,
  variants: SupplierVariant[] = [],
): SupplierProductResult {
  const title = item.productNameEn || item.productName || "Untitled CJ product";
  const price = toNumber(item.sellPrice);
  return {
    providerKey: "CJ",
    externalProductId: item.pid,
    title,
    description: "description" in item ? item.description : undefined,
    productUrl: "productUrl" in item ? item.productUrl : undefined,
    imageUrl: item.productImage,
    category: item.categoryName,
    variants: variants.length > 0 ? variants : price !== null
      ? [
          {
            externalVariantId: item.pid,
            name: title,
            unitCost: price,
            currency: "USD",
            inventory: null,
          },
        ]
      : [],
    moq: 1, // CJ dropshipping listings are generally single-unit MOQ unless noted otherwise
    warehouses: [],
    confidence: price !== null ? 0.7 : 0.4,
    raw: item,
  };
}

export function mapCjVariant(variant: CjVariant): SupplierVariant {
  const totalInventory = variant.inventories?.reduce(
    (sum, entry) => sum + (entry.totalInventory ?? entry.cjInventory ?? 0),
    0,
  );
  return {
    externalVariantId: variant.vid,
    name: variant.variantNameEn || variant.variantSku || variant.vid,
    unitCost: toNumber(variant.variantSellPrice),
    currency: "USD",
    inventory: totalInventory ?? variant.inventory ?? null,
  };
}

export function mapCjFreightOptions(
  options: CjFreightOption[],
  externalProductId: string,
  externalVariantId: string | undefined,
  destinationCountry: string,
  destinationPostalCode: string | undefined,
): ShippingQuote[] {
  return options.map((option) => {
    const [minDays, maxDays] = parseAging(option.logisticAging);
    return {
      providerKey: "CJ",
      externalProductId,
      externalVariantId,
      destinationCountry,
      destinationPostalCode,
      unitCost: null, // shipping-only quote; unit cost comes from the product/variant lookup
      shippingCost: toNumber(option.logisticPrice),
      currency: option.currency || "USD",
      shippingMethod: option.logisticName ?? null,
      estimatedDeliveryDaysMin: minDays,
      estimatedDeliveryDaysMax: maxDays,
      warehouse: null,
      quoteDate: new Date(),
      raw: option,
    };
  });
}

function parseAging(aging: string | undefined): [number | null, number | null] {
  if (!aging) return [null, null];
  const match = aging.match(/(\d+)\s*-\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2])];
  const single = aging.match(/\d+/);
  return single ? [Number(single[0]), Number(single[0])] : [null, null];
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
}
