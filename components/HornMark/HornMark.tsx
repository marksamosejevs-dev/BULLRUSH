"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HornMark.module.css";

interface HornMarkProps {
  className?: string;
  /** Plays the "lock into position" build animation once, on mount/in-view. */
  animated?: boolean;
  title?: string;
}

/**
 * The BULLRUSH horn mark, reproduced as vector geometry — two tapered
 * crescent horns closing toward a center point, with a small pendant
 * beneath. Renders in `currentColor` so it can sit on bone or ink.
 */
export function HornMark({ className, animated = false, title = "BULLRUSH" }: HornMarkProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [locked, setLocked] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLocked(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // slight delay reads as deliberate, mechanical engagement rather than a pop-in
          const t = window.setTimeout(() => setLocked(true), 120);
          observer.disconnect();
          return () => window.clearTimeout(t);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <svg
      ref={ref}
      className={[styles.mark, animated ? styles.animated : "", locked ? styles.locked : "", className]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 240 190"
      role="img"
      aria-label={title}
      fill="currentColor"
    >
      <path
        className={styles.left}
        d="M24 24 C -10 60, 10 120, 112 140 C 70 110, 55 50, 24 24 Z"
      />
      <path
        className={styles.right}
        d="M216 24 C 250 60, 230 120, 128 140 C 170 110, 185 50, 216 24 Z"
      />
      <path className={styles.pendant} d="M108 149 L132 149 L126 184 L114 184 Z" />
    </svg>
  );
}
