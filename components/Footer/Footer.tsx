import { HornMark } from "@/components/HornMark/HornMark";
import styles from "./Footer.module.css";

const SHOP = [
  { label: "BULLRUSH DAILY", href: "#product" },
  { label: "THE SYSTEM", href: "#" },
];

const BRAND = [
  { label: "THE STANDARD", href: "#standard" },
  { label: "SCIENCE", href: "#evidence" },
  { label: "FAQ", href: "#faq" },
];

const LEGAL = [
  { label: "PRIVACY POLICY", href: "#" },
  { label: "TERMS OF SERVICE", href: "#" },
  { label: "SHIPPING & RETURNS", href: "#faq" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brandCol}>
          <HornMark className={styles.mark} />
          <p className={styles.name}>BULLRUSH</p>
          <p className={styles.descriptor}>MEN&rsquo;S PERFORMANCE STANDARD</p>
        </div>

        <nav className={styles.col} aria-label="Shop">
          <p className={styles.colHead}>SHOP</p>
          {SHOP.map((l) => (
            <a key={l.label} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Brand">
          <p className={styles.colHead}>BRAND</p>
          {BRAND.map((l) => (
            <a key={l.label} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Legal">
          <p className={styles.colHead}>LEGAL</p>
          {LEGAL.map((l) => (
            <a key={l.label} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <hr className="rule rule--dark" />
        <div className={styles.bottomRow}>
          <span>© {new Date().getFullYear()} BULLRUSH</span>
          <span>
            These statements have not been evaluated by the Food and Drug Administration. This product is not
            intended to diagnose, treat, cure, or prevent any disease.
          </span>
        </div>
      </div>
    </footer>
  );
}
