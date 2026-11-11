import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { GUIDE_INDEX, GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import reading from "../reading.module.css";
import styles from "./guides.module.css";

export const metadata = pageMetadata(PAGES.guides);

/**
 * `/guides`: an index of the two guides, nothing else (ticket #42). No dates
 * and no feed; the header's Guides link points here.
 */
export default function GuidesPage() {
  const page = PAGES.guides;
  return (
    <SiteFrame page={page}>
      <div className={reading.page}>
        <PageHeader title={page.h1} lead={GUIDE_INDEX.lead} />
        <ul className={styles.list}>
          {GUIDES.map(({ page: guide, summary }) => (
            <li key={guide.path} className={styles.item}>
              <h2 className={styles.title}>
                <a href={guide.path}>{guide.h1}</a>
              </h2>
              <p className={styles.summary}>{summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </SiteFrame>
  );
}
