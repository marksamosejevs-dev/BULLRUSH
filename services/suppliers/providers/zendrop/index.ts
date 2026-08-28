import { CONFIG } from "@/lib/config";
import {
  ShippingQuote,
  SupplierProductResult,
  SupplierProvider,
  SupplierProviderError,
  SupplierProviderStatus,
  SupplierVariant,
} from "../../supplierProvider";
import { findTool, McpHttpClient, McpTool, pickSchemaProperty } from "./mcpClient";

const ENDPOINT = process.env.ZENDROP_MCP_URL || "https://app.zendrop.com/mcp/v1";
const PROVIDER_KEY = "ZENDROP";

function client(): McpHttpClient {
  const token = process.env.ZENDROP_API_KEY!;
  return new McpHttpClient(ENDPOINT, { Authorization: `Bearer ${token}` }, PROVIDER_KEY);
}

function isConfigured(): boolean {
  return Boolean(process.env.ZENDROP_API_KEY);
}

let toolsCache: McpTool[] | null = null;
async function tools(): Promise<McpTool[]> {
  if (!toolsCache) toolsCache = await client().listTools();
  return toolsCache;
}

export const zendropProvider: SupplierProvider = {
  key: PROVIDER_KEY,
  label: "Zendrop",
  requirement: "Set ZENDROP_API_KEY (from Zendrop → Settings → API) in your environment.",

  isConfigured,

  async status(): Promise<SupplierProviderStatus> {
    if (!isConfigured()) return "NOT_CONFIGURED";
    try {
      await tools();
      return "CONNECTED";
    } catch {
      return "ERROR";
    }
  },

  async searchProducts(query: string): Promise<SupplierProductResult[]> {
    if (!isConfigured()) throw new SupplierProviderError(PROVIDER_KEY, "ZENDROP_API_KEY is not set");
    const list = await tools();
    const tool = findTool(list, ["search", "product"]) ?? findTool(list, ["product"]);
    if (!tool) {
      throw new SupplierProviderError(PROVIDER_KEY, "Zendrop MCP server did not advertise a product search tool");
    }
    const queryProp = pickSchemaProperty(tool, ["query", "keyword", "search", "q", "productName", "product_name"]);
    const args = queryProp ? { [queryProp]: query } : { query };
    const result = await client().callTool<unknown>(tool.name, args);
    return extractItems(result).map((item, i) => mapGenericProduct(item, i));
  },

  async getProduct(externalProductId: string): Promise<SupplierProductResult | null> {
    const results = await zendropProvider.searchProducts(externalProductId);
    return results.find((r) => r.externalProductId === externalProductId) ?? results[0] ?? null;
  },

  async getVariants(externalProductId: string): Promise<SupplierVariant[]> {
    const product = await zendropProvider.getProduct(externalProductId);
    return product?.variants ?? [];
  },

  async getInventory(externalProductId: string, externalVariantId?: string): Promise<number | null> {
    const variants = await zendropProvider.getVariants(externalProductId);
    if (externalVariantId) {
      return variants.find((v) => v.externalVariantId === externalVariantId)?.inventory ?? null;
    }
    return variants[0]?.inventory ?? null;
  },

  async getShippingQuote(input): Promise<ShippingQuote | null> {
    if (!isConfigured()) throw new SupplierProviderError(PROVIDER_KEY, "ZENDROP_API_KEY is not set");
    const list = await tools();
    const tool =
      findTool(list, ["shipping"]) ?? findTool(list, ["quote"]) ?? findTool(list, ["estimate", "delivery"]);
    if (!tool) {
      throw new SupplierProviderError(PROVIDER_KEY, "Zendrop MCP server did not advertise a shipping/estimate tool");
    }

    const productProp = pickSchemaProperty(tool, ["productId", "product_id", "id", "sku"]);
    const countryProp = pickSchemaProperty(tool, ["country", "destinationCountry", "destination_country", "countryCode", "shipTo", "ship_to"]);
    const zipProp = pickSchemaProperty(tool, ["postalCode", "postal_code", "zip", "zipCode", "zip_code"]);

    const args: Record<string, unknown> = {};
    if (productProp) args[productProp] = input.externalProductId;
    if (countryProp) args[countryProp] = input.destinationCountry;
    if (zipProp) args[zipProp] = input.destinationPostalCode ?? CONFIG.validationPostalCode;

    const raw = await client().callTool<unknown>(tool.name, args);
    return mapGenericShippingQuote(raw, input);
  },

  async getSupplierInfo() {
    return { name: "Zendrop", platform: "ZENDROP" };
  },
};

function extractItems(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["products", "items", "results", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function firstOf(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return null;
}

function mapGenericProduct(item: Record<string, unknown>, index: number): SupplierProductResult {
  const id = String(firstOf(item, ["id", "productId", "product_id", "sku"]) ?? `zendrop-${index}`);
  const title = String(firstOf(item, ["title", "name", "productName", "product_name"]) ?? "Untitled Zendrop product");
  const price = toNumber(firstOf(item, ["price", "cost", "unitCost", "unit_cost"]));
  const inventory = toNumber(firstOf(item, ["inventory", "stock", "quantity"]));
  return {
    providerKey: PROVIDER_KEY,
    externalProductId: id,
    title,
    description: firstOf(item, ["description"]) as string | undefined,
    productUrl: firstOf(item, ["url", "productUrl", "link"]) as string | undefined,
    imageUrl: firstOf(item, ["image", "imageUrl", "image_url"]) as string | undefined,
    variants: price !== null ? [{ externalVariantId: id, name: title, unitCost: price, currency: "USD", inventory }] : [],
    moq: 1,
    warehouses: [],
    confidence: price !== null ? 0.6 : 0.3,
    raw: item,
  };
}

function mapGenericShippingQuote(
  raw: unknown,
  input: { externalProductId: string; externalVariantId?: string; destinationCountry: string; destinationPostalCode?: string },
): ShippingQuote | null {
  const candidates = extractItems(raw);
  const item = candidates[0] ?? (typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : null);
  if (!item) return null;

  return {
    providerKey: PROVIDER_KEY,
    externalProductId: input.externalProductId,
    externalVariantId: input.externalVariantId,
    destinationCountry: input.destinationCountry,
    destinationPostalCode: input.destinationPostalCode,
    unitCost: toNumber(firstOf(item, ["unitCost", "productCost", "price"])),
    shippingCost: toNumber(firstOf(item, ["shippingCost", "shipping_cost", "cost", "price"])),
    currency: (firstOf(item, ["currency"]) as string) || "USD",
    shippingMethod: (firstOf(item, ["method", "shippingMethod", "carrier"]) as string) ?? null,
    estimatedDeliveryDaysMin: toNumber(firstOf(item, ["minDays", "deliveryDaysMin", "etaMin"])),
    estimatedDeliveryDaysMax: toNumber(firstOf(item, ["maxDays", "deliveryDaysMax", "etaMax"])),
    warehouse: (firstOf(item, ["warehouse"]) as string) ?? null,
    quoteDate: new Date(),
    raw: item,
  };
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : null;
}
