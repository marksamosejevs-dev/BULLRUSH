// Image/visual asset generation service — Phase 2.
//
// Will generate product/lifestyle visual assets for Creative rows of type
// VISUAL_ASSET. Not implemented in Phase 1.

import { isConfigured, missingVars } from "@/lib/env";
import { AgentResult, notConfigured } from "@/agents/types";

export function imagesStatus(): AgentResult {
  if (!isConfigured("images")) {
    return {
      ...notConfigured("Image generation service"),
      message: `Image generation service is not configured. Missing: ${missingVars("images").join(", ")}`,
    };
  }
  return notConfigured("Image generation service (client not implemented yet)");
}

export async function generateAsset(_brief: string): Promise<AgentResult> {
  return notConfigured("Image generation service");
}
