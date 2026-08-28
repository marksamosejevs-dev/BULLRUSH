import { SupplierProvider } from "./supplierProvider";
import { cjProvider } from "./providers/cj";
import { zendropProvider } from "./providers/zendrop";
import { hyperskuProvider } from "./providers/hypersku";
import { aliexpressProvider } from "./providers/aliexpress";

export const SUPPLIER_PROVIDERS: SupplierProvider[] = [
  cjProvider,
  zendropProvider,
  hyperskuProvider,
  aliexpressProvider,
];

export function getSupplierProvider(key: string): SupplierProvider | undefined {
  return SUPPLIER_PROVIDERS.find((p) => p.key === key);
}

export function getConfiguredSupplierProviders(): SupplierProvider[] {
  return SUPPLIER_PROVIDERS.filter((p) => p.isConfigured());
}
