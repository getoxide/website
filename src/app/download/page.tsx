import { AnchoredHeading } from "@/components/AnchoredHeading";
import { DeckText } from "@/components/DeckText";
import { DownloadBlock } from "@/components/DownloadBlock";
import { Icon } from "@/components/Icon";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { OxideMark } from "@/components/OxideMark";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { seenBefore } from "@/lib/concept-links";
import { providerInstalls, token } from "@/lib/snapshot";
import ui from "@/styles/surfaces.module.css";
import styles from "./download.module.css";

export const metadata = pageMetadata(PAGES.download);

/**
 * `/download` (Copy deck, `/download`), in the order fixed by Download
 * experience (#13): Provider requirement, buttons, signing note and verify
 * link, unsupported-platform line, then the page FAQ: anchored questions
 * with visible answers (Design system, FAQ). No closing CTA. The two steps
 * (the agent, then the app) are panels, the notes sit beside them.
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
      <div className={ui.wide}>
        <PageHeader title={page.h1} path={page.path} width="wide" />
        <div className={styles.layout}>
          <div className={styles.main}>
            <section
              className={`${ui.panel} ${styles.byoa}`}
              aria-labelledby="bring-your-own-agent"
            >
              <div className={styles.stepHead}>
                <span className={styles.step} aria-hidden="true">
                  1
                </span>
                <h2 id="bring-your-own-agent">{copy.byoa.heading}</h2>
              </div>
              <p>{copy.byoa.sentence}</p>
              <ul className={styles.providers}>
                {providerInstalls(token("requirements")!).map(
                  ({ provider, install }) => (
                    <li key={provider}>
                      <span className={styles.provider}>
                        <Icon name="terminal" />
                        {provider}
                      </span>
                      <InlineMarkdown source={install} />
                    </li>
                  ),
                )}
              </ul>
            </section>
            <div className={`${ui.panel} ${ui.glow} ${styles.get}`}>
              <div className={styles.stepHead}>
                <span className={styles.step} aria-hidden="true">
                  2
                </span>
                <span className={styles.mark} aria-hidden="true">
                  <OxideMark />
                </span>
              </div>
              <DownloadBlock />
            </div>
          </div>
          <aside className={`${ui.panel} ${styles.notes}`}>
            <span className={ui.badge}>
              <Icon name="shield-check" />
            </span>
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
          </aside>
        </div>
        <section className={styles.faq} aria-labelledby="questions">
          <h2 id="questions" className={styles.faqHeading}>
            {copy.faqHeading}
          </h2>
          <div className={ui.rows}>
            {copy.faq.map(({ id, question, answer }, i) => (
              <section key={id} className={ui.row} aria-labelledby={id}>
                <div>
                  <AnchoredHeading
                    id={id}
                    level={3}
                    label={COPY.anchorLabel(question)}
                  >
                    {question}
                  </AnchoredHeading>
                </div>
                <Prose>
                  <p>
                    <DeckText source={answer} conceptLinks={seen[4 + i]} />
                  </p>
                </Prose>
              </section>
            ))}
          </div>
        </section>
      </div>
    </SiteFrame>
  );
}
