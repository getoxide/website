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
import { seenBefore } from "@/lib/concept-links";
import { SNAPSHOT } from "@/lib/snapshot";
import styles from "../../reading.module.css";

export const metadata = pageMetadata(PAGES.docsConcepts);

/** `/docs/concepts`: the nine allowlisted GLOSSARY terms, derived. */
export default function ConceptsPage() {
  const page = PAGES.docsConcepts;
  const copy = COPY.docs.concepts;
  const { concepts } = SNAPSHOT;
  // Each definition follows its own heading and the ones before it: those
  // terms are already on the page, the others link to their sections.
  const seen = seenBefore(concepts.map((c) => c.definition)).map(
    (before, i) =>
      new Set([...before, ...concepts.slice(0, i + 1).map((c) => c.term)]),
  );
  // Every term has its heading on this page before the closing CTA.
  const all = new Set(concepts.map((c) => c.term));
  return (
    <SiteFrame page={page} conceptsSeen={all}>
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
        {concepts.map(({ term, id, definition }, i) => (
          <section key={id} className={styles.section} aria-labelledby={id}>
            <AnchoredHeading id={id} label={COPY.anchorLabel(term)}>
              {term}
            </AnchoredHeading>
            <Prose id={`${id}-definition`}>
              <Markdown source={definition} conceptLinks={seen[i]} />
            </Prose>
          </section>
        ))}
      </div>
    </SiteFrame>
  );
}
