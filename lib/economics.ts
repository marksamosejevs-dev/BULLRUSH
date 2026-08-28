// Product economics calculator.
//
// Pure, deterministic math — no fetches, no fabricated numbers. Every
// input comes from the ProductOpportunity record; every output is derived
// from those inputs with a formula documented right next to it.

export interface EconomicsInput {
  sellingPrice: number; // suggested retail price, USD
  cogs: number; // unit product cost
  shippingCost: number; // US shipping cost, per unit
  packagingCost: number;
  paymentFeePct: number; // % of selling price
  discountPct: number; // % of selling price, typical offer/discount
  refundRatePct: number; // % of orders assumed refunded
}

export interface EconomicsResult {
  landedCost: number;
  paymentFee: number;
  discountAmount: number;
  netSellingPrice: number; // selling price after the typical discount
  /** Revenue-side margin before paying for customer acquisition. */
  contributionMarginPerUnit: number;
  /** Contribution margin after the assumed refund rate is deducted. */
  grossProfitPerUnit: number;
  grossMarginPct: number;
  /** Max CPA the unit economics can absorb and still break even. */
  breakEvenCpa: number;
  /** Revenue required per ad dollar spent to break even, e.g. 2.5 = 250%. */
  breakEvenRoas: number | null;
}

export function calculateEconomics(input: EconomicsInput): EconomicsResult {
  const {
    sellingPrice,
    cogs,
    shippingCost,
    packagingCost,
    paymentFeePct,
    discountPct,
    refundRatePct,
  } = input;

  const landedCost = round2(cogs + shippingCost + packagingCost);
  const paymentFee = round2(sellingPrice * (paymentFeePct / 100));
  const discountAmount = round2(sellingPrice * (discountPct / 100));
  const netSellingPrice = round2(sellingPrice - discountAmount);

  // What's left to cover customer acquisition, before refunds.
  const contributionMarginPerUnit = round2(netSellingPrice - landedCost - paymentFee);

  // Refunds give back the unit's net selling price and forfeit the
  // contribution margin already spent on cost of goods, shipping and fees;
  // approximate the expected loss as the refund rate applied to the
  // contribution margin.
  const grossProfitPerUnit = round2(
    contributionMarginPerUnit * (1 - refundRatePct / 100)
  );

  const grossMarginPct =
    sellingPrice > 0 ? round2((grossProfitPerUnit / sellingPrice) * 100) : 0;

  const breakEvenCpa = Math.max(0, grossProfitPerUnit);

  const breakEvenRoas =
    breakEvenCpa > 0 ? round2(sellingPrice / breakEvenCpa) : null;

  return {
    landedCost,
    paymentFee,
    discountAmount,
    netSellingPrice,
    contributionMarginPerUnit,
    grossProfitPerUnit,
    grossMarginPct,
    breakEvenCpa: round2(breakEvenCpa),
    breakEvenRoas,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// Suggested pricing scenarios (Part 11) — a landed-cost-driven heuristic,
// NOT market data. A target cost-to-retail ratio per scenario, rounded to a
// .95 price point. Always label these "SUGGESTED RETAIL" in the UI.
// ---------------------------------------------------------------------------

export interface PricingScenario {
  label: "CONSERVATIVE" | "BASE" | "PREMIUM";
  targetCostRatio: number;
  sellingPrice: number;
  result: EconomicsResult;
}

const PRICING_SCENARIOS: { label: PricingScenario["label"]; targetCostRatio: number }[] = [
  { label: "CONSERVATIVE", targetCostRatio: 0.32 },
  { label: "BASE", targetCostRatio: 0.25 },
  { label: "PREMIUM", targetCostRatio: 0.18 },
];

export function suggestPricingScenarios(
  input: Omit<EconomicsInput, "sellingPrice">,
): PricingScenario[] {
  const cost = input.cogs + input.shippingCost + input.packagingCost;
  return PRICING_SCENARIOS.map(({ label, targetCostRatio }) => {
    const raw = cost / targetCostRatio;
    const sellingPrice = raw > 0 ? Math.max(0, Math.floor(raw) + 0.95) : 0;
    return {
      label,
      targetCostRatio,
      sellingPrice,
      result: calculateEconomics({ ...input, sellingPrice }),
    };
  });
}
