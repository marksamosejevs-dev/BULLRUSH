"use client";

import { Plate } from "@/components/Plate/Plate";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ContextGallery.module.css";

const ITEMS: { scene: "desk" | "bag" | "ledge"; label: string }[] = [
  { scene: "desk", label: "DESK" },
  { scene: "bag", label: "TRAVEL" },
  { scene: "ledge", label: "ROUTINE" },
];

export function ContextGallery() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby="context-heading">
      <div ref={ref} className={`container reveal ${styles.head}`}>
        <p className="eyebrow">IN CONTEXT</p>
        <h2 id="context-heading" className={styles.heading}>
          BUILT INTO
          <br />
          THE ROUTINE.
        </h2>
        <p className={styles.body}>
          The product is not the centre of the system. It is one tool inside it — beside the watch, the notebook,
          the bag.
        </p>
      </div>

      <div className={styles.gallery}>
        {ITEMS.map((item) => (
          <div key={item.scene} className={styles.tile}>
            <Plate scene={item.scene} />
            <span className={styles.tileLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
