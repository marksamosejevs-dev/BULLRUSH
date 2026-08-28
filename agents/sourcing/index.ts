// Sourcing agent — Phase 2.
//
// Will search supplier platforms, create Supplier/SupplierQuote rows, and
// flag a recommended supplier. Not implemented in Phase 1: suppliers and
// quotes are entered by hand, and unknown fields are left UNKNOWN rather
// than guessed.

import { AgentResult, notConfigured } from "../types";

export async function runSourcing(_opportunityId: string): Promise<AgentResult> {
  return notConfigured("Sourcing agent");
}
