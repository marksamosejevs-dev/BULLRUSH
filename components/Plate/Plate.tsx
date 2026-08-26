"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { availablePlates, plates } from "@/data/plates";
import styles from "./Plate.module.css";

interface PlateProps {
  scene: keyof typeof plates;
  className?: string;
  children?: ReactNode;
  /** Adds a fine grain texture over the art-directed fallback. */
  grain?: boolean;
}

/**
 * A photography slot. Tries the real supplied file first; if it 404s,
 * falls back to an art-directed material study in the same position so
 * layout never breaks and nothing looks like a broken-image icon.
 */
export function Plate({ scene, className, children, grain = true }: PlateProps) {
  const spec = plates[scene];
  const [imageFailed, setImageFailed] = useState(false);

  if (!spec) return null;

  const style: CSSProperties = { background: spec.background };

  return (
    <div className={[styles.plate, grain ? styles.grain : "", className].filter(Boolean).join(" ")} style={style}>
      {!imageFailed && availablePlates.has(spec.key) && (
        // Plain <img>: these slots accept an arbitrary future file the
        // build has no knowledge of, so static next/image sizing doesn't apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={spec.file}
          alt={spec.alt}
          className={styles.image}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      {children && <div className={styles.overlay}>{children}</div>}
    </div>
  );
}
