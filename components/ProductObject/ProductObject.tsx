"use client";

import { BottleObject } from "@/components/BottleObject/BottleObject";
import { Plate } from "@/components/Plate/Plate";
import { plates } from "@/data/plates";
import { product } from "@/data/product";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ProductObject.module.css";

const PLATE_BY_KEY: Record<string, keyof typeof plates> = {
  body: "macro-cap",
  cap: "macro-cap",
  mark: "macro-emboss",
  signal: "macro-label",
};

function MaterialRow({ index, label, copy, plateKey }: { index: number; label: string; copy: string; plateKey: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${styles.row}`}>
      <div className={styles.rowMedia}>
        <Plate scene={PLATE_BY_KEY[plateKey] ?? "macro-cap"} />
      </div>
      <div className={styles.rowText}>
        <span className={styles.rowIndex}>{String(index + 1).padStart(2, "0")}</span>
        <h3 className={styles.rowLabel}>{label}</h3>
        <p className={styles.rowCopy}>{copy}</p>
      </div>
    </div>
  );
}

export function ProductObject() {
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
          <div className={styles.bottleWrap}>
            <BottleObject lit showLabel={false} />
          </div>
        </div>

        <div className={styles.rows}>
          {product.materials.map((m, i) => (
            <MaterialRow key={m.key} index={i} label={m.label} copy={m.copy} plateKey={m.key} />
          ))}
        </div>
      </div>
    </section>
  );
}
