import { AnchoredHeading } from "@/components/AnchoredHeading";
import { DocsNav } from "@/components/DocsNav";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { GLOSSARY_URL } from "@/lib/oxide";
import { SNAPSHOT } from "@/lib/snapshot";
import styles from "../../reading.module.css";

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
            <AnchoredHeading id={id} label={COPY.anchorLabel(term)}>
              {term}
            </AnchoredHeading>
            <Prose id={`${id}-definition`}>
              <Markdown source={definition} />
            </Prose>
          </section>
        ))}
      </div>
    </SiteFrame>
  );
}
