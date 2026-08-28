// Domain discovery/registration service — Phase 2.
//
// Will check availability for BrandConcept.domainCandidates and, when an
// Approval for BUY_DOMAIN is APPROVED, register the chosen domain. Never
// purchases a domain on its own. Not implemented in Phase 1.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function domainsStatus(): AgentResult {
  if (!isConfigured("domains")) {
    return {
      ...notConfigured("Domain service"),
      message: `Domain service is not configured. Missing: ${missingVars("domains").join(", ")}`,
    };
  }
  return notConfigured("Domain service (client not implemented yet)");
}

export async function checkAvailability(_candidates: string[]): Promise<AgentResult> {
  return notConfigured("Domain service");
}

export async function purchaseDomain(_domain: string): Promise<AgentResult> {
  return notConfigured("Domain service");
}
