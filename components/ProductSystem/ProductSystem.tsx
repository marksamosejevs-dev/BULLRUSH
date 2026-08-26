"use client";

import { useState } from "react";
import { systemCategories } from "@/data/system";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ProductSystem.module.css";

export function ProductSystem() {
  const ref = useReveal<HTMLDivElement>();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className={styles.section} aria-labelledby="system-heading">
      <div ref={ref} className={`container reveal ${styles.head}`}>
        <p className="eyebrow">THE SYSTEM</p>
        <h2 id="system-heading" className={styles.heading}>
          ONE STANDARD.
          <br />
          A GROWING SYSTEM.
        </h2>
      </div>

      <ul className={styles.rows}>
        {systemCategories.map((cat) => (
          <li
            key={cat.key}
            className={styles.row}
            data-hovered={hovered === cat.key}
            onMouseEnter={() => setHovered(cat.key)}
            onMouseLeave={() => setHovered((h) => (h === cat.key ? null : h))}
          >
            {cat.status === "available" ? (
              <a href="#product" className={styles.rowLink}>
                <RowContent cat={cat} />
              </a>
            ) : (
              <div className={styles.rowLink} aria-disabled="true">
                <RowContent cat={cat} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RowContent({ cat }: { cat: (typeof systemCategories)[number] }) {
  return (
    <>
      <span className={styles.rowName}>{cat.name}</span>
      <span className={styles.rowDesc}>{cat.description}</span>
      <span className={styles.rowStatus} data-status={cat.status}>
        {cat.status === "available" ? "SHOP" : "IN DEVELOPMENT"}
      </span>
    </>
  );
}
