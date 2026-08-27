"use client";

import { useId } from "react";
import { Marble } from "@/components/Marble/Marble";
import styles from "./MarbleHornReveal.module.css";

const HORN_LEFT = "M 92,120 C 62,116 34,97 23,66 C 16,45 14,28 15,12 C 21,34 25,52 37,72 C 51,91 72,99 92,99 Z";
const PENDANT = "M 93,96 L 107,96 L 103,128 L 97,128 Z";

interface MarbleHornRevealProps {
  /** 0 (fully covering the hero) to 1 (fully revealed / gone). */
  progress: number;
}

/**
 * The signature BULLRUSH scroll moment: a macro marble field, punctured by
 * a horn-shaped cutout that grows with scroll until it swallows the whole
 * field, handing off to the hero photograph underneath. Pure CSS masking
 * over a live SVG mask definition — no photography or generated imagery.
 */
export function MarbleHornReveal({ progress }: MarbleHornRevealProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const maskId = `horn-reveal-mask-${rawId}`;
  const holeScale = 0.2 + progress * 6.5;
  const opacity = Math.max(0, 1 - progress * 1.4);

  if (opacity <= 0) return null;

  return (
    <div className={styles.overlay} style={{ opacity }} aria-hidden>
      <svg className={styles.maskDefs} width="0" height="0">
        <defs>
          {/* objectBoundingBox units make the mask stretch to whatever box it's
              applied to, rather than rendering at its own intrinsic 200x140 size. */}
          <mask id={maskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <g transform="scale(0.005 0.0071428571)">
              <rect x="0" y="0" width="200" height="140" fill="white" />
              <g style={{ transform: `translate(100px, 70px) scale(${holeScale}) translate(-100px, -70px)` }} fill="black">
                <path d={HORN_LEFT} />
                <path d={HORN_LEFT} transform="translate(200,0) scale(-1,1)" />
                <path d={PENDANT} />
              </g>
            </g>
          </mask>
        </defs>
      </svg>
      <div className={styles.masked} style={{ ["--hero-mask" as string]: `url(#${maskId})` }}>
        <div className={styles.marbleScale} style={{ transform: `scale(${1.7 + progress * 1.1})` }}>
          <Marble tone="ink" finish="polished" seed={2} />
        </div>
      </div>
    </div>
  );
}
