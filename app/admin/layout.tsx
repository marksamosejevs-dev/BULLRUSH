import type { Metadata } from "next";
import Link from "next/link";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    default: "Internal Agent",
    template: "%s — Internal Agent",
  },
  description: "BULLRUSH internal product test pipeline — not public.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>BULLRUSH</span>
          <span className={styles.brandSub}>Internal Product Agent — Phase 1</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>
            Opportunities
          </Link>
          <Link href="/admin/opportunities/new" className={styles.navLink}>
            New Opportunity
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
