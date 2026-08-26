"use client";

import { useEffect, useState } from "react";
import { Plate } from "@/components/Plate/Plate";
import { useCart } from "@/lib/cart-context";
import styles from "./CartDrawer.module.css";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CartDrawer() {
  const { lines, isOpen, closeCart, removeLine, setQuantity, subtotal } = useCart();
  const [checkoutMessage, setCheckoutMessage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div className={styles.scrim} data-open={isOpen} onClick={closeCart} aria-hidden />
      <aside
        className={styles.drawer}
        data-open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.head}>
          <h2 className={`card-title ${styles.title}`}>CART</h2>
          <button type="button" className={styles.close} onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </div>

        <hr className="rule rule--dark" />

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <a href="#product" className={styles.emptyLink} onClick={closeCart}>
              SHOP DAILY →
            </a>
          </div>
        ) : (
          <ul className={styles.lines}>
            {lines.map((line) => (
              <li key={line.id} className={styles.line}>
                <div className={styles.thumb}>
                  <Plate scene="topdown" sizes="64px" grain={false} />
                </div>
                <div className={styles.lineInfo}>
                  <p className={styles.lineName}>{line.name}</p>
                  <p className={styles.lineDescriptor}>
                    {line.descriptor} · {line.purchaseType === "subscription" ? "Subscription" : "One-time"}
                  </p>
                  <div className={styles.lineControls}>
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className={styles.remove} onClick={() => removeLine(line.id)}>
                      REMOVE
                    </button>
                  </div>
                </div>
                <span className={styles.linePrice}>
                  {line.unitPrice !== null ? formatMoney(line.unitPrice * line.quantity) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <div className={styles.foot}>
            <hr className="rule rule--dark" />
            <div className={styles.subtotalRow}>
              <span>SUBTOTAL</span>
              <span>{subtotal !== null ? formatMoney(subtotal) : "Confirmed at checkout"}</span>
            </div>
            {checkoutMessage ? (
              <p className={styles.checkoutNote}>
                Checkout is not connected yet — this is a preview build. Nothing has been charged.
              </p>
            ) : (
              <button
                type="button"
                className={`btn btn-oxblood ${styles.checkout}`}
                onClick={() => setCheckoutMessage(true)}
              >
                CHECKOUT <span className="arrow">→</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
