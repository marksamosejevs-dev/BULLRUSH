"use client";

import { useEffect, useState } from "react";
import { HornMark } from "@/components/HornMark/HornMark";
import { useCart } from "@/lib/cart-context";
import { useScrollY } from "@/lib/use-scroll-progress";
import styles from "./Header.module.css";

const NAV = [
  { label: "DAILY", href: "#product" },
  { label: "STANDARD", href: "#standard" },
  { label: "SCIENCE", href: "#facts" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const scrollY = useScrollY();
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const solid = scrollY > 72;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={[styles.header, solid ? styles.solid : ""].filter(Boolean).join(" ")}>
      <div className={[styles.progress].join(" ")} style={{ transform: `scaleX(${Math.min(scrollY / 2400, 1)})` }} />
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.logo} aria-label="BULLRUSH home">
          <HornMark className={styles.logoMark} />
          <span className={styles.logoWord}>BULLRUSH</span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href="#product" className={styles.shop}>
            SHOP
          </a>
          <button
            type="button"
            className={styles.cartButton}
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            CART <span className={styles.cartCount}>{itemCount}</span>
          </button>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span className={styles.menuBars} data-open={menuOpen} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.mobileMenu} data-open={menuOpen}>
        <nav aria-label="Mobile primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href="#product" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            SHOP
          </a>
        </nav>
        <p className={styles.mobileFoot}>MEN&rsquo;S PERFORMANCE STANDARD</p>
      </div>
    </header>
  );
}
