import { AnchoredHeading } from "@/components/AnchoredHeading";
import { CodeBlock } from "@/components/CodeBlock";
import { DeckText } from "@/components/DeckText";
import { DownloadBlock } from "@/components/DownloadBlock";
import { Icon } from "@/components/Icon";
import { OxideMark } from "@/components/OxideMark";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { seenBefore } from "@/lib/concept-links";
import ui from "@/styles/surfaces.module.css";
import styles from "./download.module.css";

export const metadata = pageMetadata(PAGES.download);

/**
 * `/download` (Copy deck, `/download`): Requirements, Download buttons (with
 * OS detection and Linux/Windows arm64 builds), Linux APT & DNF repositories,
 * signing notes and verify link, unsupported-platform line, then the page FAQ:
 * anchored questions with visible answers. No closing CTA.
 */
export default function DownloadPage() {
  const page = PAGES.download;
  const copy = COPY.download;
  const { macos, windows, linux, verify } = copy.signing;
  const seen = seenBefore([
    copy.requirements.sentence,
    copy.repos.lead,
    macos,
    windows,
    linux,
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
              aria-labelledby="what-oxide-needs"
            >
              <div className={styles.stepHead}>
                <span className={styles.step} aria-hidden="true">
                  1
                </span>
                <h2 id="what-oxide-needs">{copy.requirements.heading}</h2>
              </div>
              <p>
                <DeckText
                  source={copy.requirements.sentence}
                  conceptLinks={seen[0]}
                />
              </p>
            </section>
            <div className={`${ui.panel} ${styles.get}`}>
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

          <section
            className={`${ui.panel} ${styles.repos}`}
            aria-labelledby="linux-repositories"
          >
            <h2 id="linux-repositories">{copy.repos.heading}</h2>
            <p className={styles.reposLead}>
              <DeckText source={copy.repos.lead} conceptLinks={seen[1]} />
            </p>
            <div className={styles.repoGrid}>
              <div className={styles.repoBlock}>
                <h3>{copy.repos.aptTitle}</h3>
                <CodeBlock code={copy.repos.aptCode} lang="sh" />
              </div>
              <div className={styles.repoBlock}>
                <h3>{copy.repos.dnfTitle}</h3>
                <CodeBlock code={copy.repos.dnfCode} lang="sh" />
              </div>
            </div>
          </section>

          <div className={`${ui.panel} ${styles.notes}`}>
            <span className={ui.badge}>
              <Icon name="shield-check" />
            </span>
            <p>
              <DeckText source={macos} conceptLinks={seen[2]} />
            </p>
            <p>
              <DeckText source={windows} conceptLinks={seen[3]} />
            </p>
            <p>
              <DeckText source={linux} conceptLinks={seen[4]} />
            </p>
            <p>
              <DeckText source={verify} conceptLinks={seen[5]} />
            </p>
            <p className={styles.unsupported}>
              <DeckText source={copy.unsupported} conceptLinks={seen[6]} />
            </p>
          </div>
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
                    <DeckText source={answer} conceptLinks={seen[7 + i]} />
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
