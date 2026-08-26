"use client";

import { HornMark } from "@/components/HornMark/HornMark";
import { product } from "@/data/product";
import styles from "./BottleObject.module.css";

interface BottleObjectProps {
  className?: string;
  /** Plays the slow light-sweep across the body — used on scroll reveals. */
  lit?: boolean;
  showLabel?: boolean;
}

/**
 * A CSS-rendered study of the BULLRUSH DAILY bottle: matte body, knurled
 * cap, embossed mark. Standing in for product photography until the
 * supplied renders are available — see data/plates.ts.
 */
export function BottleObject({ className, lit = false, showLabel = true }: BottleObjectProps) {
  return (
    <div className={[styles.bottle, lit ? styles.lit : "", className].filter(Boolean).join(" ")}>
      <div className={styles.cap} aria-hidden>
        <div className={styles.capRidges} />
      </div>
      <div className={styles.body}>
        <div className={styles.sheen} aria-hidden />
        <div className={styles.emboss} aria-hidden>
          <HornMark className={styles.embossShadow} />
          <HornMark className={styles.embossHighlight} />
          <HornMark className={styles.embossMark} />
        </div>
        {showLabel && (
          <div className={styles.label}>
            <span className={styles.brand}>BULLRUSH</span>
            <span className={styles.rule} aria-hidden />
            <span className={styles.descriptor}>{product.descriptor}</span>
            <span className={styles.pack}>{product.packSize}</span>
          </div>
        )}
      </div>
    </div>
  );
}
