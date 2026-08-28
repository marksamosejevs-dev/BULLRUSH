import { SupplierProductResult, SupplierProvider, SupplierProviderStatus, SupplierVariant } from "../../supplierProvider";
import { CONFIG } from "@/lib/config";
import { cjIsConfigured, cjRequest } from "./client";
import { CjFreightOption, CjProductDetail, CjProductListItem, CjVariant, mapCjFreightOptions, mapCjProduct, mapCjVariant } from "./mapping";

export const cjProvider: SupplierProvider = {
  key: "CJ",
  label: "CJ Dropshipping",
  requirement:
    "Set CJ_ACCESS_TOKEN (a token generated in your CJ dashboard) or CJ_API_KEY (used to request one via the official API) in your environment.",

  isConfigured: cjIsConfigured,

  async status(): Promise<SupplierProviderStatus> {
    if (!cjIsConfigured()) return "NOT_CONFIGURED";
    try {
      await cjRequest("/product/list", { query: { pageNum: "1", pageSize: "1" } });
      return "CONNECTED";
    } catch {
      return "ERROR";
    }
  },

  async searchProducts(query: string): Promise<SupplierProductResult[]> {
    const data = await cjRequest<{ list?: CjProductListItem[]; total?: number }>("/product/list", {
      query: { productNameEn: query, pageNum: "1", pageSize: "20" },
    });
    return (data.list ?? []).map((item) => mapCjProduct(item));
  },

  async getProduct(externalProductId: string): Promise<SupplierProductResult | null> {
    const data = await cjRequest<CjProductDetail>("/product/query", {
      query: { pid: externalProductId },
    });
    if (!data?.pid) return null;
    const variants = await cjProvider.getVariants(externalProductId);
    return mapCjProduct(data, variants);
  },

  async getVariants(externalProductId: string): Promise<SupplierVariant[]> {
    const data = await cjRequest<CjVariant[]>("/product/variant/query", {
      query: { pid: externalProductId },
    });
    return (data ?? []).map(mapCjVariant);
  },

  async getInventory(externalProductId: string, externalVariantId?: string): Promise<number | null> {
    const variants = await cjProvider.getVariants(externalProductId);
    if (externalVariantId) {
      return variants.find((v) => v.externalVariantId === externalVariantId)?.inventory ?? null;
    }
    const known = variants.map((v) => v.inventory).filter((n): n is number => n !== null);
    return known.length > 0 ? known.reduce((a, b) => a + b, 0) : null;
  },

  async getShippingQuote(input) {
    const destinationCountry = input.destinationCountry || CONFIG.validationCountry;
    const data = await cjRequest<CjFreightOption[]>("/logistic/freightCalculate", {
      method: "POST",
      body: {
        startCountryCode: "CN",
        endCountryCode: destinationCountry,
        zip: input.destinationPostalCode || CONFIG.validationPostalCode,
        products: [
          {
            vid: input.externalVariantId ?? input.externalProductId,
            quantity: input.quantity ?? 1,
          },
        ],
      },
    });

    const quotes = mapCjFreightOptions(
      data ?? [],
      input.externalProductId,
      input.externalVariantId,
      destinationCountry,
      input.destinationPostalCode || CONFIG.validationPostalCode,
    );

    if (quotes.length === 0) return null;

    // Cheapest real option — the matching engine (Part 9/13) decides
    // whether cheapest is actually "best," this just picks one quote to
    // store per candidate.
    return quotes.reduce((best, current) =>
      (current.shippingCost ?? Infinity) < (best.shippingCost ?? Infinity) ? current : best,
    );
  },

  async getSupplierInfo() {
    return { name: "CJ Dropshipping", platform: "CJ" };
  },
};
