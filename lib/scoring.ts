// Product opportunity scoring system.
//
// Nine dimensions, each scored 0-10 by whoever enters the opportunity
// (there is no live trend/market data feed yet — see docs/NEXT_STEPS.md).
// This module only combines those inputs into one transparent, reproducible
// number; it never invents a score on its own.

export interface ScoringInput {
  trendVelocity: number;
  creativePotential: number;
  marginPotential: number;
  marketDemand: number;
  competition: number; // higher = less competitive / easier to win
  fulfillmentSimplicity: number;
  repeatPurchase: number;
  regulatoryRisk: number; // higher = lower regulatory risk
  brandability: number;
}

export type ScoreDimension = keyof ScoringInput;

// Weights sum to 1. Adjust here if priorities change — every call site
// reads from this single table.
export const SCORE_WEIGHTS: Record<ScoreDimension, number> = {
  trendVelocity: 0.15,
  marginPotential: 0.15,
  marketDemand: 0.15,
  creativePotential: 0.1,
  competition: 0.1,
  fulfillmentSimplicity: 0.1,
  repeatPurchase: 0.1,
  brandability: 0.1,
  regulatoryRisk: 0.05,
};

export const SCORE_DIMENSION_LABELS: Record<ScoreDimension, string> = {
  trendVelocity: "Trend Velocity",
  creativePotential: "Creative Potential",
  marginPotential: "Margin Potential",
  marketDemand: "Market Demand",
  competition: "Competition",
  fulfillmentSimplicity: "Fulfillment Simplicity",
  repeatPurchase: "Repeat Purchase",
  regulatoryRisk: "Regulatory Risk",
  brandability: "Brandability",
};

export const SCORE_DIMENSION_ORDER: ScoreDimension[] = [
  "trendVelocity",
  "creativePotential",
  "marginPotential",
  "marketDemand",
  "competition",
  "fulfillmentSimplicity",
  "repeatPurchase",
  "regulatoryRisk",
  "brandability",
];

/** Weighted composite, 0-10. */
export function calculateOverallScore(input: ScoringInput): number {
  const total = SCORE_DIMENSION_ORDER.reduce((sum, key) => {
    const value = clamp(input[key]);
    return sum + value * SCORE_WEIGHTS[key];
  }, 0);
  return Math.round(total * 10) / 10;
}

export type RiskLevel = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";

// Risk reads off the two dimensions that most directly signal exposure:
// regulatory risk (lower score = higher exposure) and competition (lower
// score = more crowded / harder to defend).
export function deriveRiskLevel(input: ScoringInput): RiskLevel {
  const signal = (clamp(input.regulatoryRisk) + clamp(input.competition)) / 2;
  if (signal <= 3) return "HIGH";
  if (signal <= 6) return "MEDIUM";
  return "LOW";
}

function clamp(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(10, Math.max(0, value));
}
