import { AnchoredHeading } from "@/components/AnchoredHeading";
import { DeckText } from "@/components/DeckText";
import { DownloadBlock } from "@/components/DownloadBlock";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { seenBefore } from "@/lib/concept-links";
import { providerInstalls, token } from "@/lib/snapshot";
import styles from "./download.module.css";

export const metadata = pageMetadata(PAGES.download);

/**
 * `/download` (Copy deck, `/download`), in the order fixed by Download
 * experience (#13): Provider requirement, buttons, signing note and verify
 * link, unsupported-platform line, then the page FAQ: anchored questions
 * with visible answers (Design system, FAQ). No closing CTA.
 */
export default function DownloadPage() {
  const page = PAGES.download;
  const copy = COPY.download;
  // Site copy below the buttons, in reading order: the first mention of each
  // Concepts term in it links to its Concept (Copy deck rule 4).
  const { macos, windows, verify } = copy.signing;
  const seen = seenBefore([
    macos,
    windows,
    verify,
    copy.unsupported,
    ...copy.faq.map((q) => q.answer),
  ]);
  return (
    <SiteFrame page={page}>
      <div className={styles.page}>
        <PageHeader title={page.h1} />
        <section className={styles.byoa} aria-labelledby="bring-your-own-agent">
          <h2 id="bring-your-own-agent">{copy.byoa.heading}</h2>
          <p>{copy.byoa.sentence}</p>
          <ul className={styles.providers}>
            {providerInstalls(token("requirements")!).map(
              ({ provider, install }) => (
                <li key={provider}>
                  <span className={styles.provider}>{provider}</span>{" "}
                  <InlineMarkdown source={install} />
                </li>
              ),
            )}
          </ul>
        </section>
        <DownloadBlock />
        <div className={styles.notes}>
          <p>
            <DeckText source={macos} conceptLinks={seen[0]} />
          </p>
          <p>
            <DeckText source={windows} conceptLinks={seen[1]} />
          </p>
          <p>
            <DeckText source={verify} conceptLinks={seen[2]} />
          </p>
          <p className={styles.unsupported}>
            <DeckText source={copy.unsupported} conceptLinks={seen[3]} />
          </p>
        </div>
        <section className={styles.faq} aria-labelledby="questions">
          <h2 id="questions">{copy.faqHeading}</h2>
          {copy.faq.map(({ id, question, answer }, i) => (
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
                  <DeckText source={answer} conceptLinks={seen[4 + i]} />
                </p>
              </Prose>
            </section>
          ))}
        </section>
      </div>
    </SiteFrame>
  );
}
