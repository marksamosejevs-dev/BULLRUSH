// Supplier sourcing service — Phase 2.
//
// Will search supplier platforms (Alibaba, 1688, domestic 3PLs, etc.) and
// return candidate suppliers/quotes for the Sourcing agent to write. Not
// implemented in Phase 1: suppliers are entered by hand in the dashboard.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function suppliersStatus(): AgentResult {
  if (!isConfigured("suppliers")) {
    return {
      ...notConfigured("Supplier sourcing service"),
      message: `Supplier sourcing service is not configured. Missing: ${missingVars("suppliers").join(", ")}`,
    };
  }
  return notConfigured("Supplier sourcing service (client not implemented yet)");
}

export async function searchSuppliers(_query: string): Promise<AgentResult> {
  return notConfigured("Supplier sourcing service");
}
