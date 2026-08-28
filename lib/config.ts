// Central, non-secret configuration. Secrets (API keys) stay in
// lib/env.ts / process.env directly inside each provider — this file is
// just the small set of tunable values the brief asked not to hardcode.

export const CONFIG = {
  market: process.env.DEFAULT_MARKET || "US",
  validationCountry: process.env.DEFAULT_VALIDATION_COUNTRY || "US",
  validationPostalCode: process.env.DEFAULT_VALIDATION_POSTAL_CODE || "90210",

  // Validator recommendation thresholds, out of 100 (overallScore * 10).
  testThreshold: numOr(process.env.VALIDATION_TEST_THRESHOLD, 75),
  watchThreshold: numOr(process.env.VALIDATION_WATCH_THRESHOLD, 55),
};

function numOr(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
