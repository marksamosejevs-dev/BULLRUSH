"use client";

import { BottleObject } from "@/components/BottleObject/BottleObject";
import { product } from "@/data/product";
import { useReveal } from "@/lib/use-reveal";
import styles from "./FinalCTA.module.css";

export function FinalCTA() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <div className={styles.bottleWrap} aria-hidden>
        <BottleObject showLabel={false} className={styles.bottle} />
      </div>
      <div ref={ref} className={`container reveal ${styles.content}`}>
        <h2 className={styles.headline}>
          POWER UNDER
          <br />
          CONTROL.
        </h2>
        <p className={styles.product}>{product.name}</p>
        <a href="#product" className={`btn btn-oxblood ${styles.cta}`}>
          SHOP DAILY <span className="arrow">→</span>
        </a>
      </div>
    </section>
  );
}
