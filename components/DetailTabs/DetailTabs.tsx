"use client";

import { useState } from "react";
import { ingredients } from "@/data/formula";
import { faqItems } from "@/data/faq";
import { timelineStages } from "@/data/timeline";
import { trustClaims } from "@/data/trust";
import { useReveal } from "@/lib/use-reveal";
import styles from "./DetailTabs.module.css";

const TABS = ["FORMULA", "WHAT TO EXPECT", "FAQ", "TESTING"] as const;
type Tab = (typeof TABS)[number];

function FormulaPanel() {
  return (
    <div className={styles.panelBody}>
      {ingredients.length > 0 ? (
        <p className={styles.lead}>
          {ingredients.length} ingredients, listed in full above with dose and function — no proprietary blend
          hides the amounts.
        </p>
      ) : (
        <p className={styles.lead}>
          Full formulation detail is being finalized for publication. We will not list a formula here until it can
          be shown in full and stand behind it.
        </p>
      )}
      <a href="#ingredients" className={styles.jump}>
        VIEW INGREDIENTS →
      </a>
    </div>
  );
}

function WhatToExpectPanel() {
  return (
    <div className={styles.panelBody}>
      <div className={styles.stageRow}>
        {timelineStages.map((stage) => (
          <div key={stage.day} className={styles.stageCard}>
            <span className={styles.stageDay}>{stage.day}</span>
            <span className={styles.stageKicker}>{stage.kicker}</span>
            <p className={styles.stageBody}>{stage.body}</p>
          </div>
        ))}
      </div>
      <p className={styles.closing}>NOT A TRANSFORMATION. A STANDARD MAINTAINED.</p>
    </div>
  );
}

function FaqPanel() {
  return (
    <div className={styles.panelBody}>
      <div className={styles.faqList}>
        {faqItems.slice(0, 5).map((item) => (
          <div key={item.question} className={styles.faqItem}>
            <p className={styles.faqQ}>{item.question}</p>
            <p className={styles.faqA}>{item.answer}</p>
          </div>
        ))}
      </div>
      <a href="#faq" className={styles.jump}>
        SEE FULL FAQ →
      </a>
    </div>
  );
}

function TestingPanel() {
  return (
    <div className={styles.panelBody}>
      <div className={styles.testGrid}>
        {trustClaims.map((c) => (
          <div key={c.key} className={styles.testItem}>
            <p className={styles.testLabel}>{c.label}</p>
            <p className={styles.testDetail}>{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailTabs() {
  const ref = useReveal<HTMLDivElement>();
  const [active, setActive] = useState<Tab>("FORMULA");

  return (
    <div ref={ref} className={`reveal ${styles.wrap}`}>
      <div className={styles.tabStrip} role="tablist" aria-label="Product details">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active === t}
            className={styles.tab}
            data-active={active === t}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div key={active} className={styles.panel}>
        {active === "FORMULA" && <FormulaPanel />}
        {active === "WHAT TO EXPECT" && <WhatToExpectPanel />}
        {active === "FAQ" && <FaqPanel />}
        {active === "TESTING" && <TestingPanel />}
      </div>
    </div>
  );
}
