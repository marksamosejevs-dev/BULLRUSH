"use client";

import { ritual } from "@/data/brand";
import { useReveal } from "@/lib/use-reveal";
import styles from "./DailyStandard.module.css";

export function DailyStandard() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby="ritual-heading">
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        <p className="eyebrow">THE RITUAL</p>
        <h2 id="ritual-heading" className={styles.heading}>
          THE DAILY STANDARD.
        </h2>

        <ol className={styles.list}>
          {ritual.map((step) => (
            <li key={step.index} className={styles.step}>
              <span className={styles.stepIndex}>{step.index}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
