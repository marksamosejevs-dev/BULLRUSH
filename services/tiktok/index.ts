// TikTok ads service — explicitly out of scope for Phase 1. Will create
// campaigns only when an Approval for LAUNCH_TIKTOK or INCREASE_BUDGET is
// APPROVED. Never spends money on its own.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function tiktokStatus(): AgentResult {
  if (!isConfigured("tiktok")) {
    return {
      ...notConfigured("TikTok campaign service"),
      message: `TikTok campaign service is not configured. Missing: ${missingVars("tiktok").join(", ")}`,
    };
  }
  return notConfigured("TikTok campaign service (not implemented — Phase 2+)");
}

export async function launchCampaign(_brief: unknown): Promise<AgentResult> {
  return notConfigured("TikTok campaign service");
}
