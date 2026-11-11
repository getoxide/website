import { AnchoredHeading } from "@/components/AnchoredHeading";
import { Capture } from "@/components/Capture";
import { DeckText } from "@/components/DeckText";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { Reveal } from "@/components/Reveal";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import type { Page } from "@/content/pages";
import type { ProviderPageCopy } from "@/content/provider-pages";
import { seenBefore } from "@/lib/concept-links";
import { token } from "@/lib/snapshot";
import styles from "./ProviderPage.module.css";

/** The deck writes the token as `⟨platforms⟩`: rendered from the Snapshot. */
export const renderPlatforms = (text: string) =>
  text.replaceAll("`⟨platforms⟩`", token("platforms") ?? "");

/**
 * A Provider landing page (Copy deck, `/claude-code-gui` and `/codex-gui`):
 * the H1 and the locked intro key sentence, the canonical definition, the
 * outline sections, then the page FAQ with anchored questions and visible
 * answers. The closing CTA comes from `SiteFrame`. Everything is in the HTML;
 * the sections only reveal on scroll once JavaScript runs.
 */
export function ProviderPage({
  page,
  copy,
}: {
  page: Page;
  copy: ProviderPageCopy;
}) {
  const definition = token("definition")!;
  const sections = copy.sections.flatMap((s) => s.paragraphs);
  const faq = copy.faq.map((q) => renderPlatforms(q.answer));
  // Concepts terms mentioned so far, in reading order (Copy deck rule 4).
  const seen = seenBefore([copy.intro, definition, ...sections, ...faq]);
  let n = 2;
  return (
    <SiteFrame page={page}>
      <div className={styles.page}>
        <PageHeader
          title={page.h1}
          lead={<DeckText source={copy.intro} conceptLinks={seen[0]} />}
        />
        <p className={styles.definition} data-testid="definition">
          <DeckText source={definition} conceptLinks={seen[1]} />
        </p>
        {copy.sections.map(({ id, heading, paragraphs }, i) => (
          <Reveal key={id} className={styles.section}>
            <section aria-labelledby={id}>
              <AnchoredHeading id={id} label={COPY.anchorLabel(heading)}>
                {heading}
              </AnchoredHeading>
              <Prose>
                {paragraphs.map((p) => (
                  <p key={p}>
                    <DeckText source={p} conceptLinks={seen[n++]} />
                  </p>
                ))}
              </Prose>
              {i === 0 ? <Capture slot={copy.captureSlot} /> : null}
            </section>
          </Reveal>
        ))}
        <section className={styles.faq} aria-labelledby="questions">
          <h2 id="questions">{COPY.download.faqHeading}</h2>
          {copy.faq.map(({ id, question }, i) => (
            <section key={id} aria-labelledby={id}>
              <AnchoredHeading
                id={id}
                level={3}
                label={COPY.anchorLabel(question)}
              >
                {question}
              </AnchoredHeading>
              <Prose>
                <p>
                  <DeckText source={faq[i]} conceptLinks={seen[n++]} />
                </p>
              </Prose>
            </section>
          ))}
        </section>
      </div>
    </SiteFrame>
  );
}
