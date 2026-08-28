// Shopify service — Phase 2.
//
// Will create draft (unpublished) products via the Shopify Admin API when
// an Approval for PUBLISH_PRODUCT is APPROVED. Never publishes live
// listings on its own. Not implemented in Phase 1: no requests are made
// even if credentials are present, because there is no caller yet.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function shopifyStatus(): AgentResult {
  if (!isConfigured("shopify")) {
    return {
      ...notConfigured("Shopify service"),
      message: `Shopify service is not configured. Missing: ${missingVars("shopify").join(", ")}`,
    };
  }
  return notConfigured("Shopify service (client not implemented yet)");
}

export async function createDraftProduct(_input: unknown): Promise<AgentResult> {
  return notConfigured("Shopify service");
}
