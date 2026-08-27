"use client";

import { Marble } from "@/components/Marble/Marble";
import { trustClaims } from "@/data/trust";
import { TRUST_ICONS } from "@/lib/trust-icons";
import { useReveal } from "@/lib/use-reveal";
import styles from "./DossierTrustRow.module.css";

export function DossierTrustRow() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`reveal ${styles.row}`}>
      <div className={styles.marbleLayer} aria-hidden>
        <Marble tone="bone" finish="rough" seed={44} />
      </div>
      {trustClaims.map((c) => (
        <div key={c.key} className={styles.item}>
          <span className={styles.icon} aria-hidden>
            {TRUST_ICONS[c.key]}
          </span>
          <span className={styles.label}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
