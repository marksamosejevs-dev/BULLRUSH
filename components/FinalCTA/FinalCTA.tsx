"use client";

import { Plate } from "@/components/Plate/Plate";
import { product } from "@/data/product";
import { trustClaims } from "@/data/trust";
import { useReveal } from "@/lib/use-reveal";
import styles from "./FinalCTA.module.css";

export function FinalCTA() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="final" className={styles.section}>
      <div className={styles.plateLayer} aria-hidden>
        <Plate scene="reflection" sizes="100vw">
          <div className={styles.scrim} />
        </Plate>
      </div>
      <div ref={ref} className={`container reveal ${styles.content}`}>
        <h2 className={styles.headline}>
          POWER UNDER
          <br />
          CONTROL.
        </h2>
        <p className={styles.product}>{product.name}</p>
        <ul className={styles.trust}>
          {trustClaims.map((c) => (
            <li key={c.key}>{c.label}</li>
          ))}
        </ul>
        <a href="#product" className={`btn btn-oxblood ${styles.cta}`}>
          SHOP DAILY <span className="arrow">→</span>
        </a>
      </div>
    </section>
  );
}
