"use client";

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

interface Crop {
  src: string;
  position: string;
  scale: number;
  contrast: number;
  brightness: number;
  blur: number;
  mirror?: boolean;
}

/**
 * BULLRUSH's one recognizable stone identity — every crop below is drawn
 * from the same two real photographs used in the "BUILT IN SILENCE." /
 * "STRENGTH WITH RESTRAINT." material interludes (public/images/geometry.jpg,
 * public/images/empty-ledge.jpg): dark fractured rock against brushed
 * black metal. No procedural texture, no unrelated marble. Variation
 * comes only from crop, exposure and blur — never a different material.
 */
const CROPS: Record<Finish, Crop[]> = {
  rough: [
    { src: "/images/geometry.jpg", position: "82% 16%", scale: 1.35, contrast: 1.25, brightness: 0.82, blur: 0 },
    { src: "/images/geometry.jpg", position: "48% 30%", scale: 1.05, contrast: 1.15, brightness: 0.88, blur: 0 },
    { src: "/images/geometry.jpg", position: "92% 44%", scale: 2.15, contrast: 1.3, brightness: 0.78, blur: 0 },
    { src: "/images/geometry.jpg", position: "70% 10%", scale: 1.3, contrast: 1.1, brightness: 0.88, blur: 5 },
    { src: "/images/geometry.jpg", position: "82% 16%", scale: 1.35, contrast: 1.25, brightness: 0.82, blur: 0, mirror: true },
  ],
  cut: [
    { src: "/images/empty-ledge.jpg", position: "50% 78%", scale: 1.25, contrast: 1.1, brightness: 0.92, blur: 0 },
    { src: "/images/empty-ledge.jpg", position: "50% 58%", scale: 1.0, contrast: 1.05, brightness: 0.96, blur: 0 },
    { src: "/images/empty-ledge.jpg", position: "26% 46%", scale: 1.55, contrast: 1.1, brightness: 0.9, blur: 0 },
    { src: "/images/empty-ledge.jpg", position: "64% 28%", scale: 1.1, contrast: 1.35, brightness: 0.85, blur: 0 },
    { src: "/images/empty-ledge.jpg", position: "50% 58%", scale: 1.0, contrast: 1.05, brightness: 0.96, blur: 0, mirror: true },
  ],
  polished: [
    { src: "/images/geometry.jpg", position: "13% 76%", scale: 1.4, contrast: 0.95, brightness: 0.92, blur: 2 },
    { src: "/images/geometry.jpg", position: "13% 76%", scale: 1.4, contrast: 0.95, brightness: 0.92, blur: 2, mirror: true },
    { src: "/images/empty-ledge.jpg", position: "50% 18%", scale: 1.2, contrast: 0.85, brightness: 1.02, blur: 1 },
    { src: "/images/geometry.jpg", position: "38% 62%", scale: 1.15, contrast: 0.8, brightness: 1.0, blur: 3 },
  ],
};

/** Exposure applied on top of a crop's own contrast/brightness, keyed by tone. */
const TONE_EXPOSURE: Record<Tone, { brightness: number; contrast: number }> = {
  ink: { brightness: 0.86, contrast: 1.02 },
  graphite: { brightness: 1.04, contrast: 0.98 },
  bone: { brightness: 2.0, contrast: 0.7 },
};

export function Marble({ tone = "ink", finish = "polished", seed = 7, className, children }: MarbleProps) {
  const pool = CROPS[finish];
  const crop = pool[Math.abs(seed) % pool.length]!;
  const exposure = TONE_EXPOSURE[tone];
  const brightness = crop.brightness * exposure.brightness;
  const contrast = crop.contrast * exposure.contrast;
  const filter = `grayscale(1) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})${
    crop.blur ? ` blur(${crop.blur}px)` : ""
  }`;
  // Zoom is expressed as a negative inset (rather than a CSS transform) so the
  // masked hero reveal — which nests this inside its own transform and an SVG
  // mask — has one fewer compositing layer to reconcile.
  const insetPct = (((crop.scale - 1) / 2) * 100).toFixed(1);

  return (
    <div className={[styles.marble, className].filter(Boolean).join(" ")}>
      <div
        className={styles.photo}
        style={{
          backgroundImage: `url(${crop.src})`,
          backgroundPosition: crop.position,
          inset: `-${insetPct}%`,
          filter,
          transform: crop.mirror ? "scaleX(-1)" : undefined,
        }}
      />
      <div className={[styles.wash, styles[`wash${tone[0]!.toUpperCase()}${tone.slice(1)}`]].join(" ")} aria-hidden />
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
