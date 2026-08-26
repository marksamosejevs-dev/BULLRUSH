"use client";

import { benefits } from "@/data/benefits";
import { useReveal } from "@/lib/use-reveal";
import styles from "./Benefits.module.css";

function BenefitCard({ index, name, copy }: { index: string; name: string; copy: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${styles.card}`} tabIndex={0}>
      <span className={styles.number}>{index}</span>
      <span className={styles.rule} aria-hidden />
      <h3 className={`card-title ${styles.name}`}>{name}</h3>
      <p className={styles.copy}>{copy}</p>
    </div>
  );
}

export function Benefits() {
  return (
    <section className={styles.section} aria-labelledby="benefits-heading">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">BENEFITS</p>
        <h2 id="benefits-heading" className={styles.heading}>
          BUILT FOR
          <br />
          THE STANDARD.
        </h2>
      </div>

      <div className={`container ${styles.grid}`}>
        {benefits.map((b) => (
          <BenefitCard key={b.index} index={b.index} name={b.name} copy={b.copy} />
        ))}
      </div>
    </section>
  );
}
