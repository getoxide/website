import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import { readmeUrl } from "@/lib/oxide";
import ui from "@/styles/surfaces.module.css";
import styles from "./privacy.module.css";

export const metadata = pageMetadata(PAGES.privacy);

/** `/privacy`: the app and the site, one panel each, side by side. */
export default function PrivacyPage() {
  const { lead, app, site } = COPY.privacy;
  const page = PAGES.privacy;
  return (
    <SiteFrame page={page}>
      <div className={ui.wide}>
        <PageHeader title={page.h1} lead={lead} path={page.path} width="wide" />
        <div className={styles.grid}>
          <section
            className={`${ui.panel} ${styles.section}`}
            aria-labelledby="app"
          >
            <span className={ui.badge}>
              <Icon name="device-desktop" />
            </span>
            <h2 id="app">{app.heading}</h2>
            <p>
              {app.sentence} {app.readmeLead}{" "}
              <a href={readmeUrl("faq")}>{app.readmeLink}</a>.
            </p>
          </section>
          <section
            className={`${ui.panel} ${styles.section}`}
            aria-labelledby="site"
          >
            <span className={ui.badge}>
              <Icon name="globe" />
            </span>
            <h2 id="site">{site.heading}</h2>
            {site.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        </div>
      </div>
    </SiteFrame>
  );
}
