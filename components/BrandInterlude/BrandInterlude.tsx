"use client";

import { Marble } from "@/components/Marble/Marble";
import { useReveal } from "@/lib/use-reveal";
import styles from "./BrandInterlude.module.css";

const GHOST_WORDS = ["DISCIPLINE", "CONTROL", "CONSISTENCY"];

export function BrandInterlude() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-label="RULE YOURSELF">
      <div className={styles.marbleLayer} aria-hidden>
        <Marble tone="ink" finish="polished" seed={3} />
      </div>
      <div className={styles.ghostWords} aria-hidden>
        {GHOST_WORDS.map((w) => (
          <span key={w} className={styles.ghostWord}>
            {w}
          </span>
        ))}
      </div>
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
