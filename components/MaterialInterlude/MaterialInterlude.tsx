"use client";

import { Plate } from "@/components/Plate/Plate";
import { plates } from "@/data/plates";
import { useReveal } from "@/lib/use-reveal";
import styles from "./MaterialInterlude.module.css";

interface MaterialInterludeProps {
  scene: keyof typeof plates;
  line: string;
}

export function MaterialInterlude({ scene, line }: MaterialInterludeProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section}>
      <Plate scene={scene}>
        <div className={styles.scrim} />
      </Plate>
      <div ref={ref} className={`reveal ${styles.copy}`}>
        <h2 className={styles.line}>{line}</h2>
      </div>
    </section>
  );
}
