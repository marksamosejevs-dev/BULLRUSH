// Meta (Facebook/Instagram) ads service — explicitly out of scope for
// Phase 1. Will create campaigns only when an Approval for LAUNCH_META or
// INCREASE_BUDGET is APPROVED. Never spends money on its own.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function metaStatus(): AgentResult {
  if (!isConfigured("meta")) {
    return {
      ...notConfigured("Meta campaign service"),
      message: `Meta campaign service is not configured. Missing: ${missingVars("meta").join(", ")}`,
    };
  }
  return notConfigured("Meta campaign service (not implemented — Phase 2+)");
}

export async function launchCampaign(_brief: unknown): Promise<AgentResult> {
  return notConfigured("Meta campaign service");
}
