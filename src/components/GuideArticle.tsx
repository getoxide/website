import { COPY } from "@/content/copy";
import { guideSources, type Guide } from "@/content/guides";
import { seenBefore } from "@/lib/concept-links";
import { AnchoredHeading } from "./AnchoredHeading";
import { DeckText } from "./DeckText";
import styles from "./GuideArticle.module.css";
import { Markdown } from "./Markdown";
import { PageHeader } from "./PageHeader";
import { Prose } from "./Prose";
import { SiteFrame } from "./SiteFrame";

/**
 * One guide: the page header with the deck's intro key sentence, the outline
 * sections in order, and the closing cross-link, all linear prose at the
 * reading width (Design system, Prose: Guides). The closing CTA block follows
 * from `SiteFrame`.
 *
 * The Concepts links come from `seenBefore` over every source in render
 * order, so the first mention of a term lands in the intro or a section body,
 * never in a heading (Copy deck rule 4).
 */
export function GuideArticle({ guide }: { guide: Guide }) {
  const { page, intro, sections, closing } = guide;
  const seen = seenBefore(guideSources(guide));
  return (
    <SiteFrame page={page}>
      <div className={styles.page}>
        <PageHeader
          title={page.h1}
          lead={<DeckText source={intro} conceptLinks={seen[0]} />}
        />
        {sections.map(({ id, heading, body }, i) => (
          <section key={id} className={styles.section} aria-labelledby={id}>
            <AnchoredHeading id={id} label={COPY.anchorLabel(heading)}>
              {heading}
            </AnchoredHeading>
            <Prose>
              <Markdown source={body} conceptLinks={seen[2 + 2 * i]} />
            </Prose>
          </section>
        ))}
        {closing ? (
          <div className={styles.closing}>
            <Prose>
              <Markdown source={closing} conceptLinks={seen.at(-1)} />
            </Prose>
          </div>
        ) : null}
      </div>
    </SiteFrame>
  );
}
