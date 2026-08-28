// Pure, deterministic "connect evidence to scores" logic (Part 3).
//
// This deliberately does NOT use an LLM or any other judgment call at
// request time — it's a fixed, auditable set of rules over real evidence
// rows. Most of the nine scoring dimensions genuinely cannot be inferred
// from web search / ad-library evidence, and this module says so rather
// than inventing a number: those dimensions come back with a neutral
// score, LOW confidence, and a reason explaining that manual review is
// needed.

import { ScoreDimension, ScoringInput, SCORE_DIMENSION_ORDER } from "./scoring";
import { CONFIG } from "./config";

export interface EvidenceRow {
  label: string;
  source: string;
  url: string | null;
  observedAt: Date;
  confidence: number;
  metricValue: number | null;
}

export interface DimensionDetail {
  score: number; // 0-10, same scale as ScoringInput
  reason: string;
  evidence: { source: string; url: string | null; observedAt: string }[];
  confidence: number; // 0-1
}

export type ScoreDetails = Record<ScoreDimension, DimensionDetail>;

const NO_SIGNAL_REASON =
  "No automated signal is available for this dimension from current research providers — left at the neutral default. Review and set manually.";

export function evaluateFromEvidence(evidence: EvidenceRow[]): {
  scores: ScoringInput;
  details: ScoreDetails;
} {
  const distinctSources = Array.from(new Set(evidence.map((e) => e.source)));
  const avgConfidence = evidence.length
    ? evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length
    : 0;

  const metaEvidence = evidence.filter((e) => e.source === "Meta Ad Library");
  const advertiserMetric = metaEvidence.find((e) => e.metricValue !== null);
  const advertiserCount = advertiserMetric?.metricValue ?? null;

  const details = {} as ScoreDetails;

  // Trend velocity: corroboration across distinct sources, weighted by
  // their average confidence — the more independent sources agree this
  // product is showing up right now, the higher the velocity read.
  details.trendVelocity = evidence.length
    ? {
        score: clamp10(4 + distinctSources.length * 1.5 + avgConfidence * 2),
        reason: `${distinctSources.length} distinct source(s) currently show evidence for this product (avg. source confidence ${(avgConfidence * 100).toFixed(0)}%).`,
        evidence: citeAll(evidence),
        confidence: clamp01(0.3 + distinctSources.length * 0.15),
      }
    : neutral();

  // Market demand: rough proxy from total evidence volume (more distinct
  // real listings/results found = more visible demand).
  details.marketDemand = evidence.length
    ? {
        score: clamp10(4 + Math.min(6, evidence.length * 0.4)),
        reason: `${evidence.length} real data point(s) found across configured research sources.`,
        evidence: citeAll(evidence),
        confidence: clamp01(0.25 + Math.min(0.5, evidence.length * 0.05)),
      }
    : neutral();

  // Creative potential and competition both read off Meta Ad Library
  // advertiser count when available — more active advertisers means more
  // creative to study, but also more competition to win against.
  if (advertiserCount !== null) {
    details.creativePotential = {
      score: clamp10(5 + Math.min(5, advertiserCount)),
      reason: `${advertiserCount} active Meta advertiser(s) found for this product — real creative currently running can be studied directly.`,
      evidence: citeAll(metaEvidence),
      confidence: clamp01(0.4 + Math.min(0.4, advertiserCount * 0.05)),
    };
    details.competition = {
      score: clamp10(9 - advertiserCount * 0.5),
      reason: `${advertiserCount} active Meta advertiser(s) currently competing on this product — more advertisers implies a more contested market.`,
      evidence: citeAll(metaEvidence),
      confidence: clamp01(0.4 + Math.min(0.4, advertiserCount * 0.05)),
    };
  } else {
    details.creativePotential = neutral();
    details.competition = neutral();
  }

  // Nothing in the current provider set gives a real signal for these —
  // say so rather than guessing.
  details.marginPotential = neutral();
  details.fulfillmentSimplicity = neutral();
  details.repeatPurchase = neutral();
  details.regulatoryRisk = neutral();
  details.brandability = neutral();

  const scores = Object.fromEntries(
    SCORE_DIMENSION_ORDER.map((dim) => [dim, details[dim].score]),
  ) as unknown as ScoringInput;

  return { scores, details };
}

export type RecommendedAction = "TEST" | "WATCH" | "REJECT";

export function recommendAction(overallScore0to10: number): {
  action: RecommendedAction;
  reason: string;
} {
  const percent = overallScore0to10 * 10;
  if (percent >= CONFIG.testThreshold) {
    return {
      action: "TEST",
      reason: `Overall score ${percent.toFixed(0)}/100 meets the TEST threshold (${CONFIG.testThreshold}).`,
    };
  }
  if (percent >= CONFIG.watchThreshold) {
    return {
      action: "WATCH",
      reason: `Overall score ${percent.toFixed(0)}/100 is between WATCH (${CONFIG.watchThreshold}) and TEST (${CONFIG.testThreshold}) — keep monitoring for more evidence.`,
    };
  }
  return {
    action: "REJECT",
    reason: `Overall score ${percent.toFixed(0)}/100 is below the WATCH threshold (${CONFIG.watchThreshold}).`,
  };
}

function neutral(): DimensionDetail {
  return { score: 5, reason: NO_SIGNAL_REASON, evidence: [], confidence: 0.1 };
}

function citeAll(evidence: EvidenceRow[]) {
  return evidence
    .slice(0, 8)
    .map((e) => ({ source: e.source, url: e.url, observedAt: e.observedAt.toISOString() }));
}

function clamp10(value: number): number {
  return Math.round(Math.min(10, Math.max(0, value)) * 10) / 10;
}

function clamp01(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}
