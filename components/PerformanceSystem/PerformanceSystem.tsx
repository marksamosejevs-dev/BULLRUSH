"use client";

import { useState } from "react";
import { systemNodePositions, systemNodes } from "@/data/system-diagram";
import { useReveal } from "@/lib/use-reveal";
import styles from "./PerformanceSystem.module.css";

export function PerformanceSystem() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const node = systemNodes[active];

  return (
    <section className={styles.section} aria-labelledby="system-diagram-heading">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">THE SYSTEM</p>
        <h2 id="system-diagram-heading" className={styles.heading}>
          PERFORMANCE
          <br />
          IS A SYSTEM.
        </h2>
      </div>

      <div ref={ref} className={`container reveal-scale ${styles.diagramWrap}`}>
        <div className={styles.diagram}>
          <svg className={styles.lines} viewBox="0 0 100 100" aria-hidden>
            {systemNodePositions.map((pos, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={pos.left}
                y2={pos.top}
                className={[styles.line, active === i ? styles.lineActive : ""].filter(Boolean).join(" ")}
              />
            ))}
          </svg>

          <div className={styles.hub}>
            <span className={styles.hubEyebrow}>BULLRUSH</span>
            <span className={styles.hubLabel}>THE STANDARD</span>
          </div>

          {systemNodes.map((n, i) => {
            const pos = systemNodePositions[i];
            return (
              <button
                key={n.key}
                type="button"
                className={[styles.node, active === i ? styles.nodeActive : ""].filter(Boolean).join(" ")}
                style={{ left: `${pos?.left ?? 50}%`, top: `${pos?.top ?? 50}%` }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-pressed={active === i}
              >
                {n.label}
              </button>
            );
          })}
        </div>

        <div className={styles.panel} aria-live="polite">
          <span className={styles.panelIndex}>{String(active + 1).padStart(2, "0")}</span>
          <span className={styles.panelLabel}>{node?.label}</span>
          <p className={styles.panelCopy}>{node?.copy}</p>
        </div>
      </div>

      <div className={`container ${styles.mobileList}`}>
        {systemNodes.map((n, i) => (
          <div key={n.key} className={styles.mobileItem}>
            <span className={styles.mobileIndex}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className={styles.mobileLabel}>{n.label}</p>
              <p className={styles.mobileCopy}>{n.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
