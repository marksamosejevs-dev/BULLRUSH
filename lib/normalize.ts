// Product name normalization (Part 2).
//
// Deterministic, mechanical, and transparent on purpose — no AI guessing.
// "Creatine Monohydrate Gummies", "Creatine Gummies" and "5g Creatine
// Chews" all reduce to the same normalizedName ("Creatine Gummies") via:
//   1. strip quantities/units and punctuation
//   2. drop filler/qualifier words that describe the ingredient, not the
//      product form
//   3. map known synonyms for the same product form to one canonical word
// The raw, un-normalized name a source used is never discarded — callers
// are expected to keep it in `aliases`.

const FILLER_WORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "with",
  "monohydrate",
  "dietary",
  "supplement",
  "supplements",
  "formula",
  "premium",
  "natural",
  "new",
  "best",
  "flavored",
  "flavour",
  "flavor",
]);

// product-form synonyms -> canonical form word
const FORM_SYNONYMS: Record<string, string> = {
  chews: "gummies",
  chew: "gummies",
  gummy: "gummies",
  gummies: "gummies",
  capsules: "capsules",
  capsule: "capsules",
  caps: "capsules",
  tablets: "tablets",
  tablet: "tablets",
  tabs: "tablets",
  powder: "powder",
  softgels: "softgels",
  softgel: "softgels",
};

// e.g. "5g", "120ct", "30ml", "2x", "10oz", plain numbers
const UNIT_QUANTITY_RE = /\b\d+(\.\d+)?\s*(g|mg|kg|ml|l|oz|lb|lbs|ct|count|pack|packs|x)\b/gi;
const BARE_NUMBER_RE = /\b\d+(\.\d+)?\b/g;
const PUNCTUATION_RE = /[^\p{L}\p{N}\s]/gu;

export function normalizeProductName(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(UNIT_QUANTITY_RE, " ")
    .replace(BARE_NUMBER_RE, " ")
    .replace(PUNCTUATION_RE, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned
    .split(" ")
    .filter((token) => token.length > 0 && !FILLER_WORDS.has(token))
    .map((token) => FORM_SYNONYMS[token] ?? token);

  // De-duplicate consecutive/repeated tokens (e.g. synonym mapping can
  // collapse "gummy gummies" style inputs into repeats).
  const deduped = tokens.filter((token, i) => tokens.indexOf(token) === i);

  if (deduped.length === 0) return titleCase(cleaned || raw.trim());
  return titleCase(deduped.join(" "));
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}
