"use client";

import { transparencyItems } from "@/data/transparency";
import { useReveal } from "@/lib/use-reveal";
import styles from "./Transparency.module.css";

export function Transparency() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby="transparency-heading">
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        <p className="eyebrow">TRANSPARENCY</p>
        <h2 id="transparency-heading" className={styles.heading}>
          THE STANDARD IS
          <br />
          MEASURABLE.
        </h2>

        {transparencyItems.length > 0 ? (
          <div className={styles.grid}>
            {transparencyItems.map((item) => (
              <div key={item.label} className={styles.item}>
                <h3 className={styles.itemLabel}>{item.label}</h3>
                <p className={styles.itemDetail}>{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.pending}>
            Sourcing, manufacturing and testing documentation will be published here as it is finalized. We would
            rather show nothing than show something we cannot stand behind.
          </p>
        )}
      </div>
    </section>
  );
}
