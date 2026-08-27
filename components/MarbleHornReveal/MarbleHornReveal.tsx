"use client";

import { useId } from "react";
import { Marble } from "@/components/Marble/Marble";
import styles from "./MarbleHornReveal.module.css";

/**
 * Horn-mark paths pre-normalized into the 0–1 objectBoundingBox space
 * (source path coordinates divided by the original 200x140 viewBox).
 * Kept in a single coordinate system — rather than nesting a CSS-pixel
 * transform inside an SVG-unit rescale — to avoid the sub-pixel
 * precision loss that produced a dithered mask edge under software
 * rendering.
 */
const HORN_LEFT =
  "M 0.46,0.857143 C 0.31,0.828571 0.17,0.692857 0.115,0.471429 C 0.08,0.321429 0.07,0.2 0.075,0.085714 C 0.105,0.242857 0.125,0.371429 0.185,0.514286 C 0.255,0.65 0.36,0.707143 0.46,0.707143 Z";
const PENDANT = "M 0.465,0.685714 L 0.535,0.685714 L 0.515,0.914286 L 0.485,0.914286 Z";

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
  // A complex bezier mask rendered below ~0.6 of its natural size dithers under
  // software rasterization (no GPU compositor) — keeping a floor here trades a
  // touch of the smallest starting size for a mask that always rasterizes clean.
  const holeScale = 0.85 + progress * 5.85;
  const opacity = Math.max(0, 1 - progress * 1.4);

  if (opacity <= 0) return null;

  return (
    <div className={styles.overlay} style={{ opacity }} aria-hidden>
      <svg className={styles.maskDefs} width="0" height="0">
        <defs>
          {/* objectBoundingBox units make the mask stretch to whatever box it's
              applied to, rather than rendering at its own intrinsic 200x140 size. */}
          <mask id={maskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <rect x="0" y="0" width="1" height="1" fill="white" />
            <g transform={`translate(0.5 0.5) scale(${holeScale}) translate(-0.5 -0.5)`} fill="black">
              <path d={HORN_LEFT} />
              <path d={HORN_LEFT} transform="translate(1,0) scale(-1,1)" />
              <path d={PENDANT} />
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
