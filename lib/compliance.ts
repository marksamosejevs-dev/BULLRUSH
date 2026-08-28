// Compliance gate (Part 14). The categories below are the only ones that
// require a human compliance review before a product can leave SOURCING —
// this list is deliberately conservative. Nothing here infers compliance
// from a listing existing, and nothing here claims regulatory approval.

export type RiskCategory =
  | "UNKNOWN"
  | "STANDARD"
  | "COSMETIC"
  | "INGESTIBLE"
  | "SUPPLEMENT"
  | "MEDICAL_DEVICE"
  | "REGULATED";

export const RISK_CATEGORIES: RiskCategory[] = [
  "UNKNOWN",
  "STANDARD",
  "COSMETIC",
  "INGESTIBLE",
  "SUPPLEMENT",
  "MEDICAL_DEVICE",
  "REGULATED",
];

const CATEGORIES_REQUIRING_REVIEW: RiskCategory[] = [
  "SUPPLEMENT",
  "INGESTIBLE",
  "COSMETIC",
  "MEDICAL_DEVICE",
  "REGULATED",
];

export function requiresComplianceReview(riskCategory: RiskCategory): boolean {
  return CATEGORIES_REQUIRING_REVIEW.includes(riskCategory);
}

export type ComplianceStatus = "NOT_REQUIRED" | "REQUIRED" | "IN_REVIEW" | "CLEARED";

export function initialComplianceStatus(riskCategory: RiskCategory): ComplianceStatus {
  return requiresComplianceReview(riskCategory) ? "REQUIRED" : "NOT_REQUIRED";
}

// A product may be sourced/sampled for research at any compliance status —
// what it must NOT do is proceed toward build while still gated.
export function canProceedToBuild(complianceStatus: ComplianceStatus): boolean {
  return complianceStatus === "NOT_REQUIRED" || complianceStatus === "CLEARED";
}
