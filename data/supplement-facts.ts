/**
 * Supplement Facts panel data.
 *
 * Intentionally empty — BULLRUSH DAILY's serving size, servings per
 * container, and per-ingredient Amount Per Serving / %DV figures have not
 * been supplied to this build. Do not populate this file with invented
 * quantities, percentages, or footnotes. Once the real label copy exists,
 * fill in `servingSize` / `servingsPerContainer` / `rows` and the panel
 * will render the full regulatory-style table automatically in place of
 * its holding state.
 */

export interface SupplementFactsRow {
  name: string;
  amountPerServing: string;
  dailyValue: string | null; // null renders "†" (no established DV), matching real label convention
}

export interface SupplementFactsData {
  servingSize: string;
  servingsPerContainer: string;
  rows: SupplementFactsRow[];
  footnotes: string[];
}

export const supplementFacts: SupplementFactsData | null = null;
