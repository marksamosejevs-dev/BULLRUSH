"use client";

import { useReveal } from "@/lib/use-reveal";
import styles from "./BrandInterlude.module.css";

export function BrandInterlude() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-label="RULE YOURSELF">
      <div ref={ref} className={`reveal-scale ${styles.inner}`}>
        <h2 className={styles.headline}>
          RULE
          <br />
          <span className={styles.accent}>YOURSELF</span>
        </h2>
      </div>
    </section>
  );
}
