"use client";

import { useReveal } from "@/lib/use-reveal";
import styles from "./ProblemNarrative.module.css";

export function ProblemNarrative() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby="problem-heading">
      <div ref={ref} className={`container reveal ${styles.grid}`}>
        <div>
          <p className="eyebrow">THE PROBLEM</p>
          <h2 id="problem-heading" className={styles.heading}>
            MODERN LIFE
            <br />
            WORKS AGAINST
            <br />
            THE STANDARD.
          </h2>
        </div>
        <div className={styles.copy}>
          <p>
            Sleep gets shorter. Work gets heavier. Training competes with stress, travel and inconsistent nutrition.
          </p>
          <p>
            Maintaining consistent energy, recovery and performance gets harder when the system around you creates
            constant friction — not because you&rsquo;ve stopped trying.
          </p>
          <p className={styles.answer}>
            <span className={styles.answerLabel}>THE BULLRUSH APPROACH</span>
            Build a repeatable daily standard around training, recovery, nutrition and disciplined supplementation.
          </p>
        </div>
      </div>
    </section>
  );
}
