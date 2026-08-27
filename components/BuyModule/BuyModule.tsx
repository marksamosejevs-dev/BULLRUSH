"use client";

import { useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { Plate } from "@/components/Plate/Plate";
import { product } from "@/data/product";
import { trustClaims } from "@/data/trust";
import { useCart, type PurchaseType } from "@/lib/cart-context";
import { useReveal } from "@/lib/use-reveal";
import styles from "./BuyModule.module.css";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function BuyModule() {
  const { addLine } = useCart();
  const ref = useReveal<HTMLDivElement>();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const hasSubscription = product.variants.some((v) => v.purchaseType === "subscription");

  const handleAdd = () => {
    addLine({
      name: product.name,
      descriptor: product.descriptor,
      purchaseType,
      quantity,
      unitPrice: product.price?.amount ?? null,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  };

  return (
    <section id="product" className={styles.section} aria-labelledby="buy-heading">
      <div ref={ref} className={`container reveal-scale ${styles.grid}`}>
        <div className={styles.pedestal}>
          <div className={styles.pedestalMarble} aria-hidden>
            <Marble tone="graphite" finish="polished" seed={5} />
          </div>
          <div className={styles.media}>
            <Plate scene="lying" sizes="(min-width: 900px) 46vw, 90vw" />
          </div>
          <span className={[styles.tag, styles.tagPack].join(" ")}>{product.packSize}</span>
          <span className={[styles.tag, styles.tagTrust].join(" ")}>
            {trustClaims[2]?.label} · {trustClaims[3]?.label}
          </span>
        </div>

        <div className={styles.card}>
          <p className="eyebrow">BULLRUSH DAILY</p>
          <h2 id="buy-heading" className={`card-title ${styles.title}`}>
            {product.descriptor}
          </h2>
          <p className={styles.pack}>{product.packSize}</p>

          <div className={styles.priceRow}>
            {product.price ? (
              <span className={styles.price}>{formatPrice(product.price.amount, product.price.currency)}</span>
            ) : (
              <span className={styles.pricePending}>Price confirmed at checkout</span>
            )}
          </div>

          {hasSubscription && (
            <div className={styles.toggle} role="radiogroup" aria-label="Purchase type">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={purchaseType === v.purchaseType}
                  className={[styles.toggleOption, purchaseType === v.purchaseType ? styles.toggleActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPurchaseType(v.purchaseType)}
                >
                  {v.label}
                  {v.savingPercent ? <span className={styles.save}>SAVE {v.savingPercent}%</span> : null}
                </button>
              ))}
            </div>
          )}

          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>QUANTITY</span>
            <div className={styles.stepper}>
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <button type="button" className={`btn btn-primary ${styles.cta}`} onClick={handleAdd}>
            {justAdded ? "ADDED" : "ADD TO CART"} <span className="arrow">→</span>
          </button>

          <p className={styles.note}>{product.shippingNote}</p>
        </div>
      </div>
    </section>
  );
}
