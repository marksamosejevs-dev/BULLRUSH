"use client";

import { useEffect, useRef, useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { Plate } from "@/components/Plate/Plate";
import { storyPanels } from "@/data/horizontal-story";
import styles from "./HorizontalStory.module.css";

const PANEL_COUNT = storyPanels.length;

/**
 * A vertical-scroll-driven horizontal sequence: RAW → DISCIPLINE → CONTROL
 * → DAILY. Desktop pins the section and translates the panel track as the
 * user scrolls through it; mobile drops the pin and lets the same track
 * scroll natively with snap points.
 */
export function HorizontalStory() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(mq.matches && !reduceMq.matches);
    update();
    mq.addEventListener("change", update);
    reduceMq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduceMq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) {
      setProgress(0);
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = wrapperRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollable = rect.height - window.innerHeight;
          const raw = scrollable > 0 ? -rect.top / scrollable : 0;
          setProgress(Math.min(1, Math.max(0, raw)));
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pinned]);

  return (
    <section
      ref={wrapperRef}
      className={styles.wrapper}
      style={pinned ? { height: `${PANEL_COUNT * 100}svh` } : undefined}
      aria-label="From raw to daily: the BULLRUSH standard"
    >
      <div className={styles.sticky} data-pinned={pinned}>
        <div
          className={styles.track}
          data-pinned={pinned}
          style={pinned ? { transform: `translateX(-${progress * (PANEL_COUNT - 1) * 100}vw)` } : undefined}
        >
          {storyPanels.map((panel) => (
            <div key={panel.key} className={styles.panel}>
              <div className={styles.marbleLayer} aria-hidden>
                <Marble tone={panel.tone} finish={panel.finish} seed={panel.key.length * 13} />
              </div>
              {panel.key === "daily" && (
                <div className={styles.productLayer} aria-hidden>
                  <Plate scene="macro-emboss" sizes="60vw" />
                </div>
              )}
              <div className={styles.panelContent}>
                <span className={styles.word}>{panel.word}</span>
                <span className={styles.phrase}>{panel.phrase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
