"use client";

import { useState } from "react";
import { Marble } from "@/components/Marble/Marble";
import { Plate } from "@/components/Plate/Plate";
import { product } from "@/data/product";
import { trustClaims } from "@/data/trust";
import { TRUST_ICONS } from "@/lib/trust-icons";
import { useCart, type PurchaseType } from "@/lib/cart-context";
import { useReveal } from "@/lib/use-reveal";
import styles from "./DossierPurchase.module.css";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function DossierPurchase() {
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
    <div ref={ref} className={`reveal-scale ${styles.grid}`}>
      <div className={styles.stage}>
        <div className={styles.stageMarble} aria-hidden>
          <Marble tone="graphite" finish="polished" seed={73} />
        </div>
        <div className={styles.stageShadow} aria-hidden />
        <div className={styles.media}>
          <Plate scene="reflection" sizes="(min-width: 900px) 42vw, 90vw" />
        </div>
      </div>

      <div className={styles.card}>
        <p className="eyebrow">READY TO BUY</p>
        <h3 className={`card-title ${styles.title}`}>{product.name}</h3>
        <p className={styles.pack}>{product.descriptor} · {product.packSize}</p>

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
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
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

        <div className={styles.trustRow}>
          {trustClaims.map((c) => (
            <span key={c.key} className={styles.trustItem}>
              <span aria-hidden>{TRUST_ICONS[c.key]}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
