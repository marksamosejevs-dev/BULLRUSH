"use client";

import { useEffect, useRef, useState } from "react";
import { timelineStages } from "@/data/timeline";
import { useScrollY } from "@/lib/use-scroll-progress";
import styles from "./Timeline.module.css";

export function Timeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollY = useScrollY();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const height = rect.height;
    const viewportH = window.innerHeight;
    const raw = (scrollY + viewportH * 0.75 - top) / height;
    setProgress(Math.min(1, Math.max(0, raw)));
  }, [scrollY]);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="timeline-heading">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">THE ROUTINE</p>
        <h2 id="timeline-heading" className={styles.heading}>
          BUILD
          <br />
          THE STANDARD.
        </h2>
      </div>

      <div className={`container ${styles.track}`}>
        {timelineStages.map((stage, i) => {
          const reached = progress >= i / (timelineStages.length - 1) - 0.05;
          return (
            <div key={stage.day} className={styles.stage} data-reached={reached}>
              <span className={styles.marker} aria-hidden />
              <span className={styles.day}>{stage.day}</span>
              <span className={styles.label}>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
