"use client";

import { useEffect, useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { Plate } from "@/components/Plate/Plate";
import { supplementFacts } from "@/data/supplement-facts";
import { product } from "@/data/product";
import { useReveal } from "@/lib/use-reveal";
import styles from "./SupplementFacts.module.css";

interface SupplementFactsProps {
  activeName: string | null;
  onSelectName: (name: string | null) => void;
}

interface LabelProps {
  activeName: string | null;
  onSelectName: (name: string | null) => void;
}

function Label({ activeName, onSelectName }: LabelProps) {
  if (!supplementFacts) {
    return (
      <div className={styles.pending}>
        <p className={styles.pendingTitle}>SUPPLEMENT FACTS</p>
        <div className={styles.pendingRule} />
        <p className={styles.pendingBody}>
          Serving size, servings per container and per-ingredient Amount Per Serving / %DV figures are being
          finalized for print. The full regulatory label will publish here — we would rather show nothing than a
          number we cannot stand behind.
        </p>
        <dl className={styles.pendingMeta}>
          <div>
            <dt>PACK SIZE</dt>
            <dd>{product.packSize}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className={styles.label}>
      <p className={styles.title}>Supplement Facts</p>
      <div className={styles.ruleThick} />
      <div className={styles.metaRow}>
        <span>Serving Size</span>
        <span>{supplementFacts.servingSize}</span>
      </div>
      <div className={styles.metaRow}>
        <span>Servings Per Container</span>
        <span>{supplementFacts.servingsPerContainer}</span>
      </div>
      <div className={styles.ruleThick} />
      <div className={`${styles.headRow} ${styles.tableRow}`}>
        <span>Amount Per Serving</span>
        <span>% Daily Value*</span>
      </div>
      <div className={styles.ruleThin} />
      {supplementFacts.rows.map((row) => (
        <button
          key={row.name}
          type="button"
          className={styles.row}
          data-active={activeName === row.name}
          onClick={() => onSelectName(activeName === row.name ? null : row.name)}
        >
          <span className={styles.rowName}>{row.name}</span>
          <span className={styles.rowValues}>
            <span>{row.amountPerServing}</span>
            <span>{row.dailyValue ?? "†"}</span>
          </span>
        </button>
      ))}
      <div className={styles.ruleThick} />
      {supplementFacts.footnotes.map((f) => (
        <p key={f} className={styles.footnote}>
          {f}
        </p>
      ))}
    </div>
  );
}

export function SupplementFacts({ activeName, onSelectName }: SupplementFactsProps) {
  const ref = useReveal<HTMLDivElement>();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    <div ref={ref} className={`reveal ${styles.grid}`}>
      <div className={styles.panel}>
        <Label activeName={activeName} onSelectName={onSelectName} />
        <button type="button" className={styles.expandHint} onClick={() => setExpanded(true)}>
          ENLARGE LABEL <span aria-hidden>⤢</span>
        </button>
      </div>

      <div className={styles.pedestal}>
        <div className={styles.pedestalMarble} aria-hidden>
          <Marble tone="bone" finish="polished" seed={61} />
        </div>
        <div className={styles.media}>
          <Plate scene="topdown" sizes="(min-width: 900px) 40vw, 90vw" />
        </div>
        <span className={styles.tag}>{product.packSize}</span>
      </div>

      {expanded && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Supplement Facts, enlarged">
          <button type="button" className={styles.modalBackdrop} aria-label="Close" onClick={() => setExpanded(false)} />
          <div className={styles.modalPanel}>
            <button type="button" className={styles.modalClose} onClick={() => setExpanded(false)} aria-label="Close">
              ×
            </button>
            <Label activeName={activeName} onSelectName={onSelectName} />
          </div>
        </div>
      )}
    </div>
  );
}
