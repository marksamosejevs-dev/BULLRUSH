"use client";

import { useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { ingredients } from "@/data/formula";
import { useReveal } from "@/lib/use-reveal";
import styles from "./IngredientShowcase.module.css";

interface IngredientShowcaseProps {
  activeName: string | null;
  onSelectName: (name: string | null) => void;
}

export function IngredientShowcase({ activeName, onSelectName }: IngredientShowcaseProps) {
  const ref = useReveal<HTMLDivElement>();
  const [hovered, setHovered] = useState<string | null>(null);
  const shown = hovered ?? activeName ?? ingredients[0]?.name ?? null;
  const selected = ingredients.find((i) => i.name === shown) ?? null;

  return (
    <div id="ingredients" ref={ref} className={`reveal ${styles.wrap}`}>
      {ingredients.length > 0 ? (
        <>
          <div className={styles.mosaic} role="tablist" aria-label="Key ingredients">
            {ingredients.map((ing, i) => (
              <button
                key={ing.name}
                type="button"
                role="tab"
                aria-selected={shown === ing.name}
                data-size={i === 0 || i === 6 ? "large" : i === 3 ? "wide" : "normal"}
                className={styles.tile}
                onMouseEnter={() => setHovered(ing.name)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(ing.name)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelectName(activeName === ing.name ? null : ing.name)}
              >
                <span className={styles.tileMarble} aria-hidden>
                  <Marble tone={ing.surface} finish={ing.finish} seed={i * 13 + 3} />
                </span>
                <span className={styles.tileLabel}>
                  <span className={styles.tileName}>{ing.name}</span>
                  <span className={styles.tileDose}>{ing.dose}</span>
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className={styles.detail}>
              <span className={styles.indicator} aria-hidden />
              <h3 className={styles.detailName}>{selected.name}</h3>
              <p className={styles.detailDose}>{selected.dose}</p>
              <p className={styles.detailFunction}>{selected.function}</p>
              <p className={styles.detailBody}>{selected.description}</p>
              {selected.evidenceUrl && (
                <a href={selected.evidenceUrl} className={styles.detailLink} target="_blank" rel="noreferrer">
                  VIEW SOURCE →
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.pending}>
          <div className={styles.pendingMarble} aria-hidden>
            <Marble tone="bone" finish="cut" seed={19} />
          </div>
          <p className={styles.pendingBody}>
            Full formulation detail — ingredient by ingredient, with dose, function and source — is being finalized
            for publication. This grid will show the complete formula, one ingredient at a time, once it can be
            shown in full.
          </p>
        </div>
      )}
    </div>
  );
}
