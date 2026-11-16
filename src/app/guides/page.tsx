import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { GUIDE_INDEX, GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import ui from "@/styles/surfaces.module.css";
import styles from "./guides.module.css";

export const metadata = pageMetadata(PAGES.guides);

/** A decorative icon per guide, in the order of `GUIDES`. */
const ICONS = ["code-review", "people"];

/**
 * `/guides`: an index of the two guides, nothing else (ticket #42). No dates
 * and no feed; the header's Guides link points here. Each guide is a panel
 * that is one link.
 */
export default function GuidesPage() {
  const page = PAGES.guides;
  return (
    <SiteFrame page={page}>
      <div className={ui.wide}>
        <PageHeader
          title={page.h1}
          lead={GUIDE_INDEX.lead}
          path={page.path}
          width="wide"
        />
        <ul className={styles.list}>
          {GUIDES.map(({ page: guide, summary }, i) => (
            <li
              key={guide.path}
              className={`${ui.panel} ${ui.interactive} ${styles.item}`}
            >
              <div className={styles.top}>
                <span className={ui.badge}>
                  <Icon name={ICONS[i] ?? "book"} />
                </span>
                <span className={ui.index} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className={styles.title}>
                <a href={guide.path}>{guide.h1}</a>
              </h2>
              <p className={styles.summary}>{summary}</p>
              <span className={styles.arrow} aria-hidden="true">
                <Icon name="arrow-right" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SiteFrame>
  );
}
