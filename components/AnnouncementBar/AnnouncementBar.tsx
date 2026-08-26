import { Marquee } from "@/components/Marquee/Marquee";
import styles from "./AnnouncementBar.module.css";

export function AnnouncementBar() {
  return (
    <a href="#product" className={styles.bar} aria-label="Shop BULLRUSH Daily">
      <Marquee variant="ink" duration={22} className={styles.marquee}>
        <span className={styles.item}>
          POWER UNDER CONTROL <span className={styles.sep}>&middot;</span> BULLRUSH DAILY{" "}
          <span className={styles.sep}>&middot;</span> SHOP NOW <span aria-hidden>→</span>
        </span>
      </Marquee>
    </a>
  );
}
