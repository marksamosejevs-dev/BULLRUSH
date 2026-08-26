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
 * The BULLRUSH horn mark — reproduced from the brand deck's primary-mark
 * SVG geometry (viewBox 200×140). Renders in `currentColor` so it can sit
 * on bone or ink without a second asset.
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
      viewBox="0 0 200 140"
      role="img"
      aria-label={title}
      fill="currentColor"
    >
      <path
        className={styles.left}
        d="M 92,120 C 62,116 34,97 23,66 C 16,45 14,28 15,12 C 21,34 25,52 37,72 C 51,91 72,99 92,99 Z"
      />
      <path
        className={styles.right}
        d="M 92,120 C 62,116 34,97 23,66 C 16,45 14,28 15,12 C 21,34 25,52 37,72 C 51,91 72,99 92,99 Z"
        transform="translate(200,0) scale(-1,1)"
      />
      <path className={styles.pendant} d="M 93,96 L 107,96 L 103,128 L 97,128 Z" />
    </svg>
  );
}
