// Brand agent — Phase 2.
//
// Will generate BrandConcept candidates (name, tagline, offer, domain
// candidates) for an approved opportunity. Not implemented in Phase 1:
// brand concepts are entered by hand.

import { AgentResult, notConfigured } from "../types";

export async function runBrand(_opportunityId: string): Promise<AgentResult> {
  return notConfigured("Brand agent");
}
