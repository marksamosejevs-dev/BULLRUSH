"use client";

import { useId } from "react";
import styles from "./Marble.module.css";

type Tone = "bone" | "ink" | "graphite";
type Finish = "rough" | "cut" | "polished";

interface MarbleProps {
  tone?: Tone;
  finish?: Finish;
  seed?: number;
  className?: string;
  children?: React.ReactNode;
}

const TONES: Record<Tone, { base: string; vein: string }> = {
  bone: { base: "#e7e3db", vein: "#3a362f" },
  ink: { base: "#111110", vein: "#c9c3b6" },
  graphite: { base: "#211f1c", vein: "#a49d8e" },
};

const FINISHES: Record<Finish, { baseFreq: number; octaves: number; scale: number; veinCount: number; veinOpacity: number }> = {
  rough: { baseFreq: 0.009, octaves: 5, scale: 46, veinCount: 8, veinOpacity: 0.32 },
  cut: { baseFreq: 0.008, octaves: 5, scale: 38, veinCount: 9, veinOpacity: 0.28 },
  polished: { baseFreq: 0.006, octaves: 5, scale: 26, veinCount: 12, veinOpacity: 0.2 },
};

/**
 * Procedurally generated marble/stone field — no photography, no image
 * assets. A set of near-straight vein lines is warped by fractal-noise
 * displacement into organic marble veining, entirely as live SVG. Static
 * once painted (not re-computed on scroll), so cost is a one-time
 * rasterization rather than a per-frame one.
 */
export function Marble({ tone = "ink", finish = "polished", seed = 7, className, children }: MarbleProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const filterId = `marble-filter-${rawId}`;
  const colors = TONES[tone];
  const cfg = FINISHES[finish];

  const veins = Array.from({ length: cfg.veinCount }, (_, i) => {
    const t = i / (cfg.veinCount - 1 || 1);
    const x1 = -10 + t * 120 + ((seed * (i + 1)) % 13) - 6;
    const y1 = -10;
    const x2 = x1 + 40 - ((seed * (i + 3)) % 40);
    const y2 = 110;
    const width = 0.3 + ((seed + i) % 5) * 0.35;
    return { x1, y1, x2, y2, width };
  });

  return (
    <div className={[styles.marble, className].filter(Boolean).join(" ")}>
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={cfg.baseFreq}
              numOctaves={cfg.octaves}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={cfg.scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect x="-10" y="-10" width="120" height="120" fill={colors.base} />
        <g filter={`url(#${filterId})`} stroke={colors.vein} strokeLinecap="round">
          {veins.map((v, i) => (
            <line
              key={i}
              x1={v.x1}
              y1={v.y1}
              x2={v.x2}
              y2={v.y2}
              strokeWidth={v.width}
              opacity={cfg.veinOpacity}
            />
          ))}
        </g>
      </svg>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
