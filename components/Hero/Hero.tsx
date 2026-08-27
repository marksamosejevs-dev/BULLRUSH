"use client";

import { useEffect, useState } from "react";
import { MarbleHornReveal } from "@/components/MarbleHornReveal/MarbleHornReveal";
import { Plate } from "@/components/Plate/Plate";
import { product } from "@/data/product";
import { useScrollY } from "@/lib/use-scroll-progress";
import styles from "./Hero.module.css";

export function Hero() {
  const scrollY = useScrollY();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Phase 1 (0–480px): the marble-to-horn reveal plays over the hero.
  const revealProgress = reducedMotion ? 1 : Math.min(scrollY / 480, 1);
  // Phase 2 (from 300px, over the next 900px): the hero itself recedes as the user keeps scrolling.
  const heroProgress = reducedMotion ? 0 : Math.min(Math.max(scrollY - 300, 0) / 900, 1);

  return (
    <section id="top" className={styles.hero}>
      <div
        className={styles.plateLayer}
        style={{ transform: `scale(${1 + heroProgress * 0.08})`, opacity: 1 - heroProgress * 0.55 }}
      >
        <Plate scene="hero" grain priority sizes="100vw">
          <div className={styles.scrim} />
        </Plate>
      </div>

      <div className={`container ${styles.content}`} style={{ opacity: 1 - heroProgress * 1.3 }}>
        <p className={`${styles.eyebrow} eyebrow`}>{product.descriptor} · {product.packSize}</p>
        <h1 className={styles.headline}>
          POWER UNDER
          <br />
          CONTROL
        </h1>
        <p className={styles.sub}>MEN&rsquo;S PERFORMANCE STANDARD</p>

        <div className={styles.ctas}>
          <a href="#product" className="btn btn-oxblood">
            SHOP DAILY <span className="arrow">→</span>
          </a>
          <a href="#standard" className="btn btn-ghost-invert">
            EXPLORE THE STANDARD
          </a>
        </div>
      </div>

      <MarbleHornReveal progress={revealProgress} />

      <div className={styles.scrollCue} aria-hidden style={{ opacity: 1 - revealProgress * 2.5 }}>
        <span className={styles.scrollLine} />
        <span className={styles.scrollLabel}>SCROLL</span>
      </div>
    </section>
  );
}
