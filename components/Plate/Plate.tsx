"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import { availablePlates, plates } from "@/data/plates";
import styles from "./Plate.module.css";

interface PlateProps {
  scene: keyof typeof plates;
  className?: string;
  children?: ReactNode;
  /** Adds a fine grain texture over the art-directed fallback. */
  grain?: boolean;
  /** Responsive width hint passed to next/image. Defaults to full viewport width. */
  sizes?: string;
  /** Disables lazy-loading for above-the-fold images (the hero shot). */
  priority?: boolean;
}

/**
 * A photography slot. Renders the real supplied file via next/image
 * (optimized, responsive, lazy by default); if a key has no file yet or
 * the request 404s, falls back to an art-directed material study in the
 * same position so layout never breaks.
 */
export function Plate({ scene, className, children, grain = true, sizes = "100vw", priority = false }: PlateProps) {
  const spec = plates[scene];
  const [imageFailed, setImageFailed] = useState(false);

  if (!spec) return null;

  const style: CSSProperties = { background: spec.background };

  return (
    <div className={[styles.plate, grain ? styles.grain : "", className].filter(Boolean).join(" ")} style={style}>
      {!imageFailed && availablePlates.has(spec.key) && (
        <Image
          src={spec.file}
          alt={spec.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${styles.image} plate-image`}
          onError={() => setImageFailed(true)}
        />
      )}
      {children && <div className={styles.overlay}>{children}</div>}
    </div>
  );
}
