"use client";

import { clinicalReferences } from "@/data/evidence";
import { useReveal } from "@/lib/use-reveal";
import styles from "./EvidenceSection.module.css";

export function EvidenceSection() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="evidence" className={styles.section} aria-labelledby="evidence-heading">
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        <p className="eyebrow">EVIDENCE</p>
        <h2 id="evidence-heading" className={styles.heading}>
          PROOF OVER
          <br />
          PROMISE.
        </h2>

        {clinicalReferences.length > 0 ? (
          <div className={styles.table} role="table">
            <div className={styles.tableHead} role="row">
              <span role="columnheader">INGREDIENT</span>
              <span role="columnheader">CLAIM</span>
              <span role="columnheader">SOURCE</span>
            </div>
            {clinicalReferences.map((ref) => (
              <a key={ref.ingredient + ref.source} className={styles.tableRow} role="row" href={ref.url} target="_blank" rel="noreferrer">
                <span role="cell">{ref.ingredient}</span>
                <span role="cell">{ref.claim}</span>
                <span role="cell" className={styles.tableSource}>{ref.source} →</span>
              </a>
            ))}
          </div>
        ) : (
          <p className={styles.pending}>
            We will only publish a claim here alongside the reference that substantiates it. Structured research
            references will appear in this section as the formula is finalized and documented.
          </p>
        )}
      </div>
    </section>
  );
}
