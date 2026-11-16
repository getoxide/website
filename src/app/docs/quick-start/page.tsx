import { DocsNav } from "@/components/DocsNav";
import { Icon } from "@/components/Icon";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { seenBefore } from "@/lib/concept-links";
import { SNAPSHOT, token } from "@/lib/snapshot";
import ui from "@/styles/surfaces.module.css";
import styles from "./quick-start.module.css";

export const metadata = pageMetadata(PAGES.docsQuickStart);

/** `/docs/quick-start`: the README Requirements and Quick start, derived. */
export default function QuickStartPage() {
  const page = PAGES.docsQuickStart;
  const copy = COPY.docs.quickStart;
  const [requirements, steps] = [
    token("requirements")!,
    SNAPSHOT.readme.quickStart,
  ];
  const seen = seenBefore([requirements, steps]);
  return (
    <SiteFrame page={page}>
      <div className={ui.wide}>
        <PageHeader
          title={page.h1}
          lead={copy.lead}
          path={page.path}
          width="wide"
        >
          <DocsNav path={page.path} />
        </PageHeader>
        <div className={styles.layout}>
          <section
            className={`${ui.panel} ${styles.requirements}`}
            aria-labelledby="requirements"
          >
            <h2 id="requirements" className={styles.heading}>
              <span className={ui.badge}>
                <Icon name="checklist" />
              </span>
              {copy.requirements}
            </h2>
            <Prose>
              <Markdown source={requirements} conceptLinks={seen[0]} />
            </Prose>
          </section>
          <section className={styles.steps} aria-labelledby="steps">
            <h2 id="steps" className={styles.heading}>
              <span className={ui.badge}>
                <Icon name="rocket" />
              </span>
              {copy.steps}
            </h2>
            <Prose>
              <Markdown source={steps} conceptLinks={seen[1]} />
            </Prose>
          </section>
        </div>
      </div>
    </SiteFrame>
  );
}
