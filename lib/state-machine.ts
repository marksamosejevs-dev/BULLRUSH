// Product test state machine.
//
// One status field on ProductOpportunity drives the whole pipeline. This
// module is the single source of truth for which transitions are legal —
// server actions must check canTransition() before writing a new status,
// so the lifecycle can't be corrupted from a stray form post.

export type OpportunityStatus =
  | "DISCOVERED"
  | "VALIDATING"
  | "WATCH"
  | "REJECTED"
  | "APPROVED_FOR_TEST"
  | "SOURCING"
  | "READY_TO_BUILD"
  | "BUILDING"
  | "READY_FOR_REVIEW"
  | "LIVE"
  | "PAUSED"
  | "ARCHIVED";

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  "DISCOVERED",
  "VALIDATING",
  "WATCH",
  "REJECTED",
  "APPROVED_FOR_TEST",
  "SOURCING",
  "READY_TO_BUILD",
  "BUILDING",
  "READY_FOR_REVIEW",
  "LIVE",
  "PAUSED",
  "ARCHIVED",
];

// Terminal states can still be manually archived, but nothing else.
const TRANSITIONS: Record<OpportunityStatus, OpportunityStatus[]> = {
  DISCOVERED: ["VALIDATING", "WATCH", "REJECTED"],
  VALIDATING: ["WATCH", "REJECTED", "APPROVED_FOR_TEST"],
  WATCH: ["VALIDATING", "REJECTED", "APPROVED_FOR_TEST"],
  REJECTED: [],
  APPROVED_FOR_TEST: ["SOURCING", "REJECTED"],
  SOURCING: ["READY_TO_BUILD", "REJECTED"],
  READY_TO_BUILD: ["BUILDING"],
  BUILDING: ["READY_FOR_REVIEW"],
  READY_FOR_REVIEW: ["LIVE", "BUILDING"],
  LIVE: ["PAUSED", "ARCHIVED"],
  PAUSED: ["LIVE", "ARCHIVED"],
  ARCHIVED: [],
};

// Any non-terminal, non-archived status can always be archived directly —
// an escape hatch for opportunities that are simply abandoned.
const ALWAYS_ALLOWED_TARGET: OpportunityStatus = "ARCHIVED";

export function getAllowedTransitions(from: OpportunityStatus): OpportunityStatus[] {
  const explicit = TRANSITIONS[from] ?? [];
  if (from === ALWAYS_ALLOWED_TARGET || explicit.includes(ALWAYS_ALLOWED_TARGET)) {
    return explicit;
  }
  return [...explicit, ALWAYS_ALLOWED_TARGET];
}

export function canTransition(from: OpportunityStatus, to: OpportunityStatus): boolean {
  if (from === to) return false;
  return getAllowedTransitions(from).includes(to);
}

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  DISCOVERED: "Discovered",
  VALIDATING: "Validating",
  WATCH: "Watch",
  REJECTED: "Rejected",
  APPROVED_FOR_TEST: "Approved for Test",
  SOURCING: "Sourcing",
  READY_TO_BUILD: "Ready to Build",
  BUILDING: "Building",
  READY_FOR_REVIEW: "Ready for Review",
  LIVE: "Live",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

// Coarse grouping used for badge color in the UI.
export type StatusTone = "neutral" | "info" | "positive" | "warning" | "negative";

export const STATUS_TONE: Record<OpportunityStatus, StatusTone> = {
  DISCOVERED: "neutral",
  VALIDATING: "info",
  WATCH: "warning",
  REJECTED: "negative",
  APPROVED_FOR_TEST: "positive",
  SOURCING: "info",
  READY_TO_BUILD: "info",
  BUILDING: "info",
  READY_FOR_REVIEW: "positive",
  LIVE: "positive",
  PAUSED: "warning",
  ARCHIVED: "neutral",
};
