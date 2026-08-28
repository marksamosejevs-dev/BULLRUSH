// Supplier match scoring (Part 9). Deterministic and transparent — every
// component is documented, and a field the provider didn't actually return
// contributes 0 to its component rather than a comfortable default. That's
// the literal implementation of "do not reward unknown data."

export interface MatchScoreInput {
  queryTokens: string[]; // normalized tokens from the opportunity name
  productTitle: string;
  providerKey: string;
  unitCost: number | null;
  shippingCost: number | null;
  estimatedDeliveryDaysMin: number | null;
  estimatedDeliveryDaysMax: number | null;
  moq: number | null;
  rating: number | null;
  productConfidence: number; // 0-1, from the provider's own result confidence
  hasShippingQuote: boolean;
}

export interface MatchScoreBreakdown {
  matchScore: number; // 0-20
  usDeliveryScore: number; // 0-20
  landedCostScore: number; // 0-15
  reliabilityScore: number; // 0-15
  fulfillmentAutomationScore: number; // 0-10
  privateLabelScore: number; // 0-10
  moqFlexibilityScore: number; // 0-5
  dataConfidenceScore: number; // 0-5
  totalScore: number; // sum, 0-100
  confidence: number; // 0-1
}

// Providers that fulfill and ship the order themselves (as opposed to a
// plain marketplace listing an operator would have to order/forward
// manually) get credit here — a documented fact about the provider, not a
// guess about the specific candidate.
const AUTOMATED_FULFILLMENT_PROVIDERS = new Set(["CJ", "ZENDROP", "HYPERSKU"]);

export function isObviouslyUnrelated(queryTokens: string[], productTitle: string): boolean {
  if (queryTokens.length === 0) return false;
  const titleTokens = new Set(tokenize(productTitle));
  return !queryTokens.some((t) => titleTokens.has(t));
}

export function scoreSupplierCandidate(input: MatchScoreInput): MatchScoreBreakdown {
  const titleTokens = new Set(tokenize(input.productTitle));
  const overlap = input.queryTokens.filter((t) => titleTokens.has(t)).length;
  const matchScore = input.queryTokens.length > 0 ? round((overlap / input.queryTokens.length) * 20) : 0;

  const avgDays =
    input.estimatedDeliveryDaysMin !== null && input.estimatedDeliveryDaysMax !== null
      ? (input.estimatedDeliveryDaysMin + input.estimatedDeliveryDaysMax) / 2
      : null;
  const usDeliveryScore =
    avgDays === null
      ? 0
      : avgDays <= 7
        ? 20
        : avgDays <= 12
          ? 16
          : avgDays <= 20
            ? 10
            : avgDays <= 30
              ? 5
              : 2;

  const landedCost =
    input.unitCost !== null && input.shippingCost !== null ? input.unitCost + input.shippingCost : null;
  const landedCostScore =
    landedCost === null ? 0 : landedCost <= 8 ? 15 : landedCost <= 15 ? 11 : landedCost <= 25 ? 7 : landedCost <= 40 ? 4 : 2;

  const reliabilityScore = input.rating !== null ? round(clamp(input.rating / 5, 0, 1) * 15) : 0;

  const fulfillmentAutomationScore = AUTOMATED_FULFILLMENT_PROVIDERS.has(input.providerKey) ? 8 : 3;

  // Private label availability isn't returned by any Phase 2 automated
  // provider integration — left at 0 rather than guessed. Populate by hand
  // once a supplier is contacted directly.
  const privateLabelScore = 0;

  const moqFlexibilityScore =
    input.moq === null ? 0 : input.moq <= 1 ? 5 : input.moq <= 10 ? 3 : input.moq <= 50 ? 1 : 0;

  const dataConfidenceScore = round(clamp(input.productConfidence, 0, 1) * 5);

  const totalScore =
    matchScore +
    usDeliveryScore +
    landedCostScore +
    reliabilityScore +
    fulfillmentAutomationScore +
    privateLabelScore +
    moqFlexibilityScore +
    dataConfidenceScore;

  // Overall confidence drops when shipping data is missing — landed cost
  // is the whole point of Part 10, so a quote without it is only ever
  // "partial."
  const confidence = round01(clamp(input.productConfidence, 0, 1) * (input.hasShippingQuote ? 1 : 0.6));

  return {
    matchScore,
    usDeliveryScore,
    landedCostScore,
    reliabilityScore,
    fulfillmentAutomationScore,
    privateLabelScore,
    moqFlexibilityScore,
    dataConfidenceScore,
    totalScore: round(totalScore),
    confidence,
  };
}

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2); // drop very short/noise tokens
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function round01(value: number): number {
  return Math.round(value * 100) / 100;
}
