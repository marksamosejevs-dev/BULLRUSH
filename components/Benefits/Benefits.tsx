"use client";

import { useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { benefits } from "@/data/benefits";
import { useReveal } from "@/lib/use-reveal";
import styles from "./Benefits.module.css";

const FINISHES: Array<"rough" | "cut" | "polished"> = ["rough", "cut", "polished", "cut", "rough"];

export function Benefits() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const current = benefits[active];

  return (
    <section className={styles.section} aria-labelledby="benefits-heading">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">THE STANDARD</p>
        <h2 id="benefits-heading" className={styles.heading}>
          THE STANDARD?
        </h2>
        <p className={styles.intro}>
          Maintaining strong daily performance is not one isolated variable. Energy, strength, recovery, focus and
          consistency work together as a system. BULLRUSH DAILY is built to become part of that system.
        </p>
      </div>

      <div ref={ref} className={`container reveal ${styles.layout}`}>
        <div className={styles.rows}>
          {benefits.map((b, i) => (
            <button
              key={b.key}
              type="button"
              className={[styles.row, active === i ? styles.rowActive : ""].filter(Boolean).join(" ")}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-pressed={active === i}
            >
              <span className={styles.rowName}>{b.name}</span>
              <span className={styles.rowCopy}>{b.copy}</span>
            </button>
          ))}
        </div>

        <div className={styles.visual}>
          <Marble tone="bone" finish={FINISHES[active] ?? "cut"} seed={20 + active} />
          <span className={styles.visualLabel}>{current?.name}</span>
        </div>
      </div>
    </section>
  );
}
