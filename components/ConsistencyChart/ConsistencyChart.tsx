"use client";

import { useState } from "react";
import { consistencyPoints } from "@/data/consistency-chart";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ConsistencyChart.module.css";

const VB_W = 400;
const VB_H = 220;
const PAD_X = 40;
const PAD_TOP = 20;
const PLOT_H = 160;

function coords() {
  return consistencyPoints.map((p, i) => {
    const x = PAD_X + i * ((VB_W - PAD_X * 2) / (consistencyPoints.length - 1));
    const y = PAD_TOP + PLOT_H - (p.value / 100) * PLOT_H;
    return { ...p, x, y };
  });
}

export function ConsistencyChart() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const points = coords();
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const activePoint = active !== null ? points[active] : null;

  return (
    <section className={styles.section} aria-labelledby="chart-heading">
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">THE ROUTINE</p>
        <h2 id="chart-heading" className={styles.heading}>
          CONSISTENCY
          <br />
          COMPOUNDS.
        </h2>
      </div>

      <div ref={ref} className={`container reveal ${styles.chartWrap}`}>
        <div className={styles.chart}>
          <svg className={styles.svg} viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden preserveAspectRatio="none">
            {[0, 25, 50, 75, 100].map((v) => {
              const y = PAD_TOP + PLOT_H - (v / 100) * PLOT_H;
              return <line key={v} x1={PAD_X} y1={y} x2={VB_W - PAD_X} y2={y} className={styles.grid} />;
            })}
            <path d={path} className={styles.line} pathLength={1} />
            {points.map((p, i) => (
              <circle
                key={p.day}
                cx={p.x}
                cy={p.y}
                r={active === i ? 5 : 3.5}
                className={[styles.point, active === i ? styles.pointActive : ""].filter(Boolean).join(" ")}
              />
            ))}
          </svg>

          {points.map((p, i) => (
            <button
              key={p.day}
              type="button"
              className={styles.hit}
              style={{ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              aria-label={`Day ${p.day}: ${p.tag}`}
            />
          ))}

          <div className={styles.axis} aria-hidden>
            {points.map((p) => (
              <span key={p.day} style={{ left: `${(p.x / VB_W) * 100}%` }} className={styles.axisLabel}>
                DAY {p.day}
              </span>
            ))}
          </div>

          <div className={styles.tooltip} data-visible={activePoint !== null} aria-live="polite">
            {activePoint && (
              <>
                <span className={styles.tooltipDay}>DAY {activePoint.day}</span>
                <span className={styles.tooltipTag}>{activePoint.tag}</span>
              </>
            )}
          </div>
        </div>

        <p className={styles.disclaimer}>
          Conceptual illustration of routine adherence over time — not measured data or a clinical outcome.
        </p>
      </div>
    </section>
  );
}
