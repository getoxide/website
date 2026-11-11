import { DocsNav } from "@/components/DocsNav";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { mentionedIn, seenBefore } from "@/lib/concept-links";
import { SNAPSHOT, token } from "@/lib/snapshot";
import styles from "../../reading.module.css";

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
    <SiteFrame page={page} conceptsSeen={mentionedIn([requirements, steps])}>
      <div className={styles.page}>
        <PageHeader title={page.h1} lead={copy.lead} />
        <DocsNav path={page.path} />
        <section className={styles.section} aria-labelledby="requirements">
          <h2 id="requirements">{copy.requirements}</h2>
          <Prose>
            <Markdown source={requirements} conceptLinks={seen[0]} />
          </Prose>
        </section>
        <section className={styles.section} aria-labelledby="steps">
          <h2 id="steps">{copy.steps}</h2>
          <Prose>
            <Markdown source={steps} conceptLinks={seen[1]} />
          </Prose>
        </section>
      </div>
    </SiteFrame>
  );
}
