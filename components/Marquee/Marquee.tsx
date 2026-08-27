"use client";

import type { ReactNode } from "react";
import { Marble } from "@/components/Marble/Marble";
import styles from "./Marquee.module.css";

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. Slower reads as more premium. */
  duration?: number;
  variant?: "ink" | "bone";
  className?: string;
  /** Accessible name for the region; content itself duplicates for the loop, so only the first copy is exposed. */
  ariaLabel?: string;
  /** Renders a procedural marble field behind the track instead of a flat fill. */
  marble?: boolean;
}

/**
 * A seamless horizontal marquee. Renders the content twice back-to-back
 * and animates a -50% translate so the loop has no visible seam. Pauses
 * to a static single row under prefers-reduced-motion.
 */
export function Marquee({ children, duration = 32, variant = "ink", className, ariaLabel, marble = false }: MarqueeProps) {
  return (
    <div
      className={[styles.marquee, styles[variant], className].filter(Boolean).join(" ")}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
    >
      {marble && (
        <div className={styles.marbleLayer} aria-hidden>
          <Marble tone={variant === "ink" ? "ink" : "bone"} finish="polished" seed={variant === "ink" ? 31 : 42} />
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
