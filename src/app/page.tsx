import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import styles from "./home.module.css";

export const metadata = pageMetadata(PAGES.home);

export default function HomePage() {
  return (
    <SiteFrame page={PAGES.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{PAGES.home.h1}</h1>
        <p className={styles.subheadline}>{COPY.hero.subheadline}</p>
      </section>
    </SiteFrame>
  );
}
