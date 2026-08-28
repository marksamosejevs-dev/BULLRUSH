import { STATUS_LABELS, STATUS_TONE, OpportunityStatus } from "@/lib/state-machine";
import styles from "./Badge.module.css";

export function StatusBadge({ status }: { status: OpportunityStatus | string }) {
  const tone = STATUS_TONE[status as OpportunityStatus] ?? "neutral";
  const label = STATUS_LABELS[status as OpportunityStatus] ?? status;
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}

const RISK_TONE: Record<string, keyof typeof styles> = {
  LOW: "positive",
  MEDIUM: "warning",
  HIGH: "negative",
  UNKNOWN: "neutral",
};

export function RiskBadge({ level }: { level: string }) {
  const tone = RISK_TONE[level] ?? "neutral";
  return <span className={`${styles.badge} ${styles[tone]}`}>{level}</span>;
}

export function DemoBadge() {
  return <span className={`${styles.badge} ${styles.demo}`}>Demo data</span>;
}

export function ApprovalStatusBadge({ status }: { status: string }) {
  const tone: Record<string, keyof typeof styles> = {
    PENDING: "warning",
    APPROVED: "positive",
    REJECTED: "negative",
    CANCELLED: "neutral",
  };
  return <span className={`${styles.badge} ${styles[tone[status] ?? "neutral"]}`}>{status}</span>;
}
