"use client";

import { useState } from "react";
import { DetailTabs } from "@/components/DetailTabs/DetailTabs";
import { DossierPurchase } from "@/components/DossierPurchase/DossierPurchase";
import { DossierTrustRow } from "@/components/DossierTrustRow/DossierTrustRow";
import { IngredientShowcase } from "@/components/IngredientShowcase/IngredientShowcase";
import { ProductSummary } from "@/components/ProductSummary/ProductSummary";
import { SupplementFacts } from "@/components/SupplementFacts/SupplementFacts";
import { WeekProgression } from "@/components/WeekProgression/WeekProgression";
import { useReveal } from "@/lib/use-reveal";
import styles from "./ProductDossier.module.css";

export function ProductDossier() {
  const headRef = useReveal<HTMLDivElement>();
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);

  return (
    <section id="facts" className={styles.section} aria-labelledby="facts-heading">
      <div ref={headRef} className={`container reveal ${styles.head}`}>
        <p className="eyebrow">THE FULL RECORD</p>
        <h2 id="facts-heading" className={styles.heading}>
          EVERYTHING INSIDE.
          <br />
          NOTHING HIDDEN.
        </h2>
        <p className={styles.sub}>Proof over promise.</p>
      </div>

      <div className={`container ${styles.block}`}>
        <SupplementFacts activeName={activeIngredient} onSelectName={setActiveIngredient} />
      </div>

      <div className={`container ${styles.block}`}>
        <DossierTrustRow />
      </div>

      <div className={`container ${styles.block}`}>
        <p className="eyebrow">FORMULA</p>
        <h3 className={styles.subHeading}>
          KEY INGREDIENTS.
          <br />
          BUILT TO WORK TOGETHER.
        </h3>
        <IngredientShowcase activeName={activeIngredient} onSelectName={setActiveIngredient} />
      </div>

      <div className={`container ${styles.blockSplit}`}>
        <ProductSummary />
      </div>

      <div className={`container ${styles.block}`}>
        <p className="eyebrow">READY TO BUY</p>
        <h3 className={styles.subHeading}>PURCHASE BULLRUSH DAILY.</h3>
        <DossierPurchase />
      </div>

      <div className={`container ${styles.block}`}>
        <DetailTabs />
      </div>

      <div className={`container ${styles.block}`}>
        <p className="eyebrow">THE ROUTINE, WEEK BY WEEK</p>
        <h3 className={styles.subHeading}>WHERE IT FITS.</h3>
        <WeekProgression />
      </div>
    </section>
  );
}
