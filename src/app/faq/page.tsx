import { AnchoredHeading } from "@/components/AnchoredHeading";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { mentionedIn, seenBefore } from "@/lib/concept-links";
import { faqOf } from "@/lib/faq";
import { pageMetadata } from "@/lib/metadata";
import { SNAPSHOT } from "@/lib/snapshot";
import styles from "../reading.module.css";

export const metadata = pageMetadata(PAGES.faq);

/**
 * `/faq`: the README FAQ, derived (Content #12 addendum, point 3). Every
 * question is an anchored heading and every answer is visible text, never
 * collapsed (Design system, FAQ).
 */
export default function FaqPage() {
  const page = PAGES.faq;
  const faq = faqOf(SNAPSHOT);
  const answers = faq.map((entry) => entry.answer);
  const seen = seenBefore(answers);
  return (
    <SiteFrame page={page} conceptsSeen={mentionedIn(answers)}>
      <div className={styles.page}>
        <PageHeader title={page.h1} />
        {faq.map(({ question, id, answer }, i) => (
          <section key={id} className={styles.section} aria-labelledby={id}>
            <AnchoredHeading id={id} label={COPY.anchorLabel(question)}>
              {question}
            </AnchoredHeading>
            <Prose>
              <Markdown source={answer} conceptLinks={seen[i]} />
            </Prose>
          </section>
        ))}
      </div>
    </SiteFrame>
  );
}
