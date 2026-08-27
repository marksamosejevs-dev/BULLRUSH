"use client";

import { useState } from "react";
import { Plate } from "@/components/Plate/Plate";
import { plates } from "@/data/plates";
import { product } from "@/data/product";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ProductObject.module.css";

const PLATE_BY_KEY: Record<string, keyof typeof plates> = {
  body: "reflection",
  cap: "macro-cap",
  mark: "macro-emboss",
  signal: "macro-label",
};

function MaterialRow({
  label,
  copy,
  active,
  onActivate,
}: {
  label: string;
  copy: string;
  active: boolean;
  onActivate: () => void;
}) {
  const ref = useReveal<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      className={`reveal ${styles.row} ${active ? styles.rowActive : ""}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      aria-pressed={active}
    >
      <span className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowCopy}>{copy}</span>
      </span>
    </button>
  );
}

export function ProductObject() {
  const [active, setActive] = useState(0);

  return (
    <section className={styles.section} aria-labelledby="product-object-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.sticky}>
          <p className="eyebrow">THE OBJECT</p>
          <h2 id="product-object-heading" className={styles.heading}>
            BUILT LIKE
            <br />
            AN INSTRUMENT.
          </h2>
          <div className={styles.mediaWrap}>
            {product.materials.map((m, i) => (
              <div key={m.key} className={styles.mediaLayer} data-visible={active === i}>
                <Plate scene={PLATE_BY_KEY[m.key] ?? "macro-cap"} sizes="(min-width: 900px) 42vw, 92vw" />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rows}>
          {product.materials.map((m, i) => (
            <MaterialRow
              key={m.key}
              label={m.label}
              copy={m.copy}
              active={active === i}
              onActivate={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
