"use client";

import { useEffect, useState } from "react";
import { product } from "@/data/product";
import { defaultProductLine, useCart } from "@/lib/cart-context";
import styles from "./StickyBuyBar.module.css";

/** Mobile-only sticky purchase bar, shown once the hero has been passed. */
export function StickyBuyBar() {
  const { addLine } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("top");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!(entry?.isIntersecting ?? true)), {
      threshold: 0,
      rootMargin: "-64px 0px 0px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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
