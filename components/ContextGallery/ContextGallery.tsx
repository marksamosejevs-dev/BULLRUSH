"use client";

import { useRef } from "react";
import { Plate } from "@/components/Plate/Plate";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ContextGallery.module.css";

const ITEMS: { scene: "desk" | "bag" | "lying" | "reflection" | "topdown"; label: string; shape: "wide" | "tall" }[] = [
  { scene: "desk", label: "WORK", shape: "wide" },
  { scene: "bag", label: "TRAVEL", shape: "tall" },
  { scene: "lying", label: "TRAIN", shape: "tall" },
  { scene: "reflection", label: "RESET", shape: "wide" },
  { scene: "topdown", label: "REPEAT", shape: "tall" },
];

export function ContextGallery() {
  const ref = useReveal<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby="context-heading">
      <div ref={ref} className={`container reveal ${styles.head}`}>
        <div>
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
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => scrollBy(-1)} aria-label="Previous">
            ←
          </button>
          <button type="button" className={styles.arrow} onClick={() => scrollBy(1)} aria-label="Next">
            →
          </button>
        </div>
      </div>

      <div ref={trackRef} className={styles.track}>
        {ITEMS.map((item) => (
          <div key={item.scene} className={[styles.slide, styles[item.shape]].join(" ")}>
            <Plate scene={item.scene} sizes="(min-width: 900px) 42vw, 78vw" />
            <span className={styles.slideLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
