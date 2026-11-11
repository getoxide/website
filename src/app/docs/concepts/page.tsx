import { DocsNav } from "@/components/DocsNav";
import { Icon } from "@/components/Icon";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { GLOSSARY_URL } from "@/lib/oxide";
import { SNAPSHOT } from "@/lib/snapshot";
import styles from "../docs.module.css";

export const metadata = pageMetadata(PAGES.docsConcepts);

/** `/docs/concepts`: the nine allowlisted GLOSSARY terms, derived. */
export default function ConceptsPage() {
  const page = PAGES.docsConcepts;
  const copy = COPY.docs.concepts;
  return (
    <SiteFrame page={page}>
      <div className={styles.page}>
        <PageHeader
          title={page.h1}
          lead={
            <>
              {copy.leadBefore} <a href={GLOSSARY_URL}>{copy.glossary}</a>.
            </>
          }
        />
        <DocsNav path={page.path} />
        {SNAPSHOT.concepts.map(({ term, id, definition }) => (
          <section key={id} className={styles.section} aria-labelledby={id}>
            <div className={styles.term}>
              <h2 id={id}>{term}</h2>
              <a
                className={styles.anchor}
                href={`#${id}`}
                aria-label={copy.anchorLabel(term)}
              >
                <Icon name="link" />
              </a>
            </div>
            <Prose id={`${id}-definition`}>
              <Markdown source={definition} />
            </Prose>
          </section>
        ))}
      </div>
    </SiteFrame>
  );
}
