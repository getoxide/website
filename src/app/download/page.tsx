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
            <DeckText source={copy.signing.macos} />
          </p>
          <p>
            <DeckText source={copy.signing.windows} />
          </p>
          <p>
            <DeckText source={copy.signing.verify} />
          </p>
          <p className={styles.unsupported}>
            <DeckText source={copy.unsupported} />
          </p>
        </div>
        <section className={styles.faq} aria-labelledby="questions">
          <h2 id="questions">{copy.faqHeading}</h2>
          {copy.faq.map(({ id, question, answer }) => (
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
                  <DeckText source={answer} />
                </p>
              </Prose>
            </section>
          ))}
        </section>
      </div>
    </SiteFrame>
  );
}
