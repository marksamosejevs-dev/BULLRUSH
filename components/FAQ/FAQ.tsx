"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";
import { useReveal } from "@/lib/use-reveal";
import styles from "./FAQ.module.css";

export function FAQ() {
  const ref = useReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div ref={ref} className={`container reveal ${styles.inner}`}>
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-heading" className={styles.heading}>
          QUESTIONS.
        </h2>

        <div className={styles.list}>
          {faqItems.map((item, i) => {
            const open = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <div key={item.question} className={styles.item}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    className={styles.question}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span>{item.question}</span>
                    <span className={styles.icon} data-open={open} aria-hidden>
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={styles.panel}
                  data-open={open}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
