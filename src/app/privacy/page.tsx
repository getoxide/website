import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { readmeUrl } from "@/lib/oxide";
import styles from "./privacy.module.css";

export const metadata = pageMetadata(PAGES.privacy);

export default function PrivacyPage() {
  const { lead, app, site } = COPY.privacy;
  return (
    <SiteFrame page={PAGES.privacy}>
      <div className={styles.page}>
        <PageHeader title={PAGES.privacy.h1} lead={lead} />
        <section className={styles.section} aria-labelledby="app">
          <h2 id="app">{app.heading}</h2>
          <p>
            {app.sentence} {app.readmeLead}{" "}
            <a href={readmeUrl("faq")}>{app.readmeLink}</a>.
          </p>
        </section>
        <section className={styles.section} aria-labelledby="site">
          <h2 id="site">{site.heading}</h2>
          {site.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      </div>
    </SiteFrame>
  );
}
