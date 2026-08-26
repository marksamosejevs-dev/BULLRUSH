"use client";

import { useReveal } from "@/lib/use-reveal";
import styles from "./BrandStatement.module.css";

interface BrandStatementProps {
  id?: string;
  eyebrow?: string;
  lines: string[];
  body?: string;
  variant?: "bone" | "ink";
}

/**
 * A restrained, oversized-type brand moment. Reused for "The Standard"
 * and similar statement beats — background/foreground invert by variant.
 */
export function BrandStatement({ id, eyebrow, lines, body, variant = "bone" }: BrandStatementProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id={id} className={[styles.section, styles[variant]].join(" ")}>
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className={styles.headline}>
          {lines.map((line, i) => (
            <span key={i} className={styles.line}>
              {line}
            </span>
          ))}
        </h2>
        {body && <p className={styles.body}>{body}</p>}
      </div>
    </section>
  );
}
