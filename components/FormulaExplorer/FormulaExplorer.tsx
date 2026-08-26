"use client";

import { useState } from "react";
import { ingredients } from "@/data/formula";
import { useReveal } from "@/lib/use-reveal";
import styles from "./FormulaExplorer.module.css";

export function FormulaExplorer() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const selected = ingredients[active];

  return (
    <section id="formula" className={styles.section} aria-labelledby="formula-heading">
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        <p className="eyebrow">FORMULA</p>
        <h2 id="formula-heading" className={styles.heading}>
          WHAT&rsquo;S INSIDE
          <br />
          MATTERS.
        </h2>
        <p className={styles.sub}>Proof over promise.</p>

        {ingredients.length > 0 && selected ? (
          <div className={styles.explorer}>
            <div className={styles.index} role="tablist" aria-label="Ingredient index">
              {ingredients.map((ing, i) => (
                <button
                  key={ing.name}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  className={[styles.indexItem, active === i ? styles.indexActive : ""].filter(Boolean).join(" ")}
                  onClick={() => setActive(i)}
                >
                  {ing.index}
                </button>
              ))}
            </div>
            <div className={styles.detail}>
              <h3 className={`card-title ${styles.detailName}`}>{selected.name}</h3>
              <p className={styles.detailDose}>{selected.dose}</p>
              <p className={styles.detailFunction}>{selected.function}</p>
              <p className={styles.detailBody}>{selected.description}</p>
              {selected.evidenceUrl && (
                <a href={selected.evidenceUrl} className={styles.detailLink} target="_blank" rel="noreferrer">
                  VIEW SOURCE →
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.pending}>
            <p>
              Full formulation detail — ingredient by ingredient, with dose and function — is being finalized for
              publication. This section will list the complete formula once it can be shown in full.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
