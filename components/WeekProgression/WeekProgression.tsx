"use client";

import { useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { routineChartPoints, weekStages } from "@/data/week-progression";
import { useReveal } from "@/lib/use-reveal";
import styles from "./WeekProgression.module.css";

const VB_W = 460;
const VB_H = 200;
const PAD_X = 30;
const PAD_TOP = 16;
const PLOT_H = 150;
const MAX_WEEK = 13;

function coords() {
  return routineChartPoints.map((p) => {
    const x = PAD_X + (p.week / MAX_WEEK) * (VB_W - PAD_X * 2);
    const y = PAD_TOP + PLOT_H - (p.value / 100) * PLOT_H;
    return { ...p, x, y };
  });
}

export function WeekProgression() {
  const ref = useReveal<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = weekStages[activeIndex];
  const points = coords();
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const nearestPointIndex = activeStage
    ? points.reduce(
        (best, p, i) => (Math.abs(p.week - activeStage.chartWeek) < Math.abs(points[best]!.week - activeStage.chartWeek) ? i : best),
        0
      )
    : null;

  return (
    <div ref={ref} className={`reveal ${styles.wrap}`}>
      <div className={styles.selector} role="tablist" aria-label="Week-by-week routine progression">
        {weekStages.map((stage, i) => (
          <button
            key={stage.range}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            className={styles.tab}
            data-active={activeIndex === i}
            onClick={() => setActiveIndex(i)}
          >
            {stage.range}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{activeStage?.kicker}</p>
          <p className={styles.text}>{activeStage?.body}</p>
        </div>

        <div className={styles.chartPanel}>
          <div className={styles.chartMarble} aria-hidden>
            <Marble tone="graphite" finish="cut" seed={51} />
          </div>

          <p className={styles.chartTitle}>ROUTINE CONSISTENCY</p>

          <svg className={styles.svg} viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden preserveAspectRatio="none">
            {[0, 25, 50, 75, 100].map((v) => {
              const y = PAD_TOP + PLOT_H - (v / 100) * PLOT_H;
              return <line key={v} x1={PAD_X} y1={y} x2={VB_W - PAD_X} y2={y} className={styles.grid} />;
            })}
            <path d={path} className={styles.line} pathLength={1} />
            {points.map((p, i) => (
              <circle
                key={p.week}
                cx={p.x}
                cy={p.y}
                r={nearestPointIndex === i ? 5.5 : 3}
                className={[styles.point, nearestPointIndex === i ? styles.pointActive : ""].filter(Boolean).join(" ")}
              />
            ))}
          </svg>

          <div className={styles.axis} aria-hidden>
            {points.map((p) => (
              <span key={p.week} style={{ left: `${((p.x) / VB_W) * 100}%` }} className={styles.axisLabel}>
                WK {p.week}
                {p.week === MAX_WEEK ? "+" : ""}
              </span>
            ))}
          </div>

          <p className={styles.axisLabelY}>CONSISTENCY</p>

          <p className={styles.disclaimer}>Conceptual illustration — not a clinical or physiological outcome.</p>
        </div>
      </div>
    </div>
  );
}
