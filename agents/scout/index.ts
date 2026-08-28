// Scout agent — Phase 2.
//
// Will search for candidate product opportunities from trend/ad-library
// sources and write ProductOpportunity rows with status DISCOVERED.
// Not implemented in Phase 1: opportunities are entered manually or via
// the seed script.

import { AgentResult, notConfigured } from "../types";

export async function runScout(): Promise<AgentResult> {
  return notConfigured("Scout agent");
}
