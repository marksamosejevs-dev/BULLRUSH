"use client";

import { useEffect, useRef, useState } from "react";
import { Marble } from "@/components/Marble/Marble";
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

      <div className={styles.track}>
        {timelineStages.map((stage, i) => {
          const reached = progress >= i / timelineStages.length + 0.06;
          return (
            <div key={stage.day} className={styles.stage} data-reached={reached}>
              <div className={styles.marbleLayer} aria-hidden>
                <Marble tone="graphite" finish={stage.finish} seed={i * 17 + 4} />
              </div>
              <div className={styles.stageContent}>
                <span className={styles.day}>{stage.day}</span>
                <span className={styles.kicker}>{stage.kicker}</span>
                <p className={styles.body}>{stage.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className={`container ${styles.closing}`}>NOT A TRANSFORMATION. A STANDARD MAINTAINED.</p>
    </section>
  );
}
