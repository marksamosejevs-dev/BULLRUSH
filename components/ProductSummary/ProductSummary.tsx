"use client";

import { trustClaims } from "@/data/trust";
import { product } from "@/data/product";
import { TRUST_ICONS } from "@/lib/trust-icons";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ProductSummary.module.css";

const FEATURES = [
  ...trustClaims.map((c) => c.label),
  product.packSize,
];

export function ProductSummary() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`reveal ${styles.wrap}`}>
      <h3 className={styles.heading}>
        DAILY PERFORMANCE
        <br />
        SUPPORT.
      </h3>
      <p className={styles.body}>
        BULLRUSH DAILY is built as a complete daily performance formula for men who want consistency across energy,
        strength, focus, recovery and male vitality.
      </p>

      <ul className={styles.features}>
        {FEATURES.map((f) => {
          const claim = trustClaims.find((c) => c.label === f);
          return (
            <li key={f} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden>
                {claim ? TRUST_ICONS[claim.key] : <span className={styles.featureMark} />}
              </span>
              <span>{f}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
