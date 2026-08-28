// Validator agent — Phase 2.
//
// Will pull real trend/demand evidence for a DISCOVERED opportunity and
// populate trendSignal/trendEvidence and the scoring fields automatically.
// Not implemented in Phase 1: scores and trend notes are entered by hand.

import { AgentResult, notConfigured } from "../types";

export async function runValidator(_opportunityId: string): Promise<AgentResult> {
  return notConfigured("Validator agent");
}
