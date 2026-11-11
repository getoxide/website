import { Changelog } from "@/components/Changelog";
import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { SNAPSHOT } from "@/lib/snapshot";
import styles from "../reading.module.css";

export const metadata = pageMetadata(PAGES.changelog);

/** `/changelog`: the stable releases in the Snapshot, derived (Content #12). */
export default function ChangelogPage() {
  const page = PAGES.changelog;
  return (
    <SiteFrame page={page}>
      <div className={styles.page}>
        <PageHeader title={page.h1} />
        <Changelog snapshot={SNAPSHOT} />
      </div>
    </SiteFrame>
  );
}
