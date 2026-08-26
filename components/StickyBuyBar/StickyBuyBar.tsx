"use client";

import { useEffect, useState } from "react";
import { product } from "@/data/product";
import { defaultProductLine, useCart } from "@/lib/cart-context";
import styles from "./StickyBuyBar.module.css";

/** Mobile-only sticky purchase bar. Shown once the hero is passed; hidden
 * again whenever the main buy module or the final purchase section is
 * already on screen, so it never competes with those. */
export function StickyBuyBar() {
  const { addLine } = useCart();
  const [pastHero, setPastHero] = useState(false);
  const [nearBuySection, setNearBuySection] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const heroTarget = document.getElementById("top");
    const heroObserver = heroTarget
      ? new IntersectionObserver(([entry]) => setPastHero(!(entry?.isIntersecting ?? true)), {
          threshold: 0,
          rootMargin: "-64px 0px 0px 0px",
        })
      : null;
    if (heroTarget && heroObserver) heroObserver.observe(heroTarget);

    const buyTargets = [document.getElementById("product"), document.getElementById("final")].filter(
      (el): el is HTMLElement => el !== null
    );
    const visibleSet = new Set<string>();
    const buyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSet.add(entry.target.id);
          else visibleSet.delete(entry.target.id);
        });
        setNearBuySection(visibleSet.size > 0);
      },
      { threshold: 0.15 }
    );
    buyTargets.forEach((el) => buyObserver.observe(el));

    return () => {
      heroObserver?.disconnect();
      buyObserver.disconnect();
    };
  }, []);

  const visible = pastHero && !nearBuySection;

  return (
    <div className={styles.bar} data-visible={visible} role="region" aria-label="Quick add to cart">
      <div className={styles.info}>
        <span className={styles.name}>{product.name}</span>
        <span className={styles.price}>
          {product.price
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.price.currency }).format(
                product.price.amount
              )
            : "Priced at checkout"}
        </span>
      </div>
      <button type="button" className={styles.cta} onClick={() => addLine(defaultProductLine())}>
        ADD TO CART
      </button>
    </div>
  );
}
