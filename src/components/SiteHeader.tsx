import logo from "../../content/oxide/brand/oxide-logo.svg";
import { COPY, type Link } from "@/content/copy";
import { platformDownloads, type PlatformDownload } from "@/lib/downloads";
import { isCurrent } from "@/lib/nav";
import { OS_SCRIPT } from "@/lib/os";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Button } from "./Button";
import buttonStyles from "./Button.module.css";
import { Icon } from "./Icon";
import styles from "./SiteHeader.module.css";

/** Opening one of the header's two menus closes the other, without JavaScript. */
const MENU_GROUP = "site-header";

// The logo's aspect ratio is 570 × 192; the Design system sets it 26px tall.
const LOGO_HEIGHT = 26;
const LOGO_WIDTH = Math.round((570 / 192) * LOGO_HEIGHT);

function NavLinks({ path, className }: { path: string; className: string }) {
  return (
    <ul className={className}>
      {COPY.header.links.map((link: Link) => (
        <li key={link.href}>
          <a
            className={styles.link}
            href={link.href}
            aria-current={isCurrent(link.href, path) ? "page" : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The header Download button in the `stable` Release state (ADR-0005): a
 * `<details>` menu, like the small-screen one, so it needs no JavaScript.
 * Each platform is a direct file download; the inline script's
 * `html[data-os]` puts the visitor's platform first and highlights it, and
 * without it macOS comes first. GitHub and the full `/download` page follow.
 */
function DownloadMenu({
  downloads,
  current,
}: {
  downloads: PlatformDownload[];
  current: boolean;
}) {
  const { download, downloadMenu, github } = COPY.header;
  return (
    <details className={styles.download} name={MENU_GROUP}>
      <summary
        className={`${buttonStyles.button} ${buttonStyles.nav} ${styles.downloadButton}`}
        data-current={current ? "" : undefined}
      >
        {download.label}
        <Icon name="chevron-down" className={styles.chevron} />
      </summary>
      <ul className={styles.downloadPanel}>
        {downloads.map(({ platform, url, sublabel, event }) => (
          <li key={platform} className={styles[platform]}>
            <a
              className={styles.downloadLink}
              href={url}
              data-goatcounter-click={event}
            >
              <Icon name="download" className={styles.downloadIcon} />
              <span className={styles.downloadText}>
                <span className={styles.downloadLabel}>
                  {downloadMenu.platforms[platform]}
                </span>
                <span className={styles.downloadSublabel}>{sublabel}</span>
              </span>
            </a>
          </li>
        ))}
        <li className={styles.downloadMore}>
          <a
            className={styles.downloadLink}
            href={github.href}
            data-goatcounter-click="github-cta"
          >
            <Icon name="mark-github" className={styles.downloadIcon} />
            <span className={styles.downloadLabel}>{downloadMenu.github}</span>
          </a>
        </li>
        <li>
          <a
            className={styles.downloadLink}
            href={download.href}
            aria-current={current ? "page" : undefined}
          >
            <Icon name="arrow-right" className={styles.downloadIcon} />
            <span className={styles.downloadLabel}>{downloadMenu.all}</span>
          </a>
        </li>
      </ul>
    </details>
  );
}

/**
 * The site header (Design system, Header). Not sticky. On the home it sits
 * transparent over the hero; elsewhere it is in flow with a bottom border.
 * Below 860px the four links move into a `<details>` menu, which opens and
 * closes without JavaScript; the Download button stays visible. With a stable
 * release the Download button opens the Download menu; otherwise it links to
 * `/download`.
 */
export function SiteHeader({
  path,
  snapshot = SNAPSHOT,
}: {
  path: string;
  snapshot?: Snapshot;
}) {
  const { header } = COPY;
  const overlay = path === "/";
  const downloads =
    snapshot.release.state === "stable" ? platformDownloads(snapshot) : null;
  const downloadCurrent = isCurrent(header.download.href, path);
  return (
    <header
      className={`${styles.header} ${overlay ? styles.overlay : styles.inFlow}`}
    >
      {/* Sets `html[data-os]` while the page is parsed, before any download
          link exists, so the header menu and the Download block order and
          style the visitor's platform at first paint (Download experience
          #13). It never redirects or downloads. */}
      <script dangerouslySetInnerHTML={{ __html: OS_SCRIPT }} />
      {/* Plain anchors throughout, as on the 404 page: every site link is a
          full page load of a static file, with no client router involved. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        className={styles.logo}
        href="/"
        aria-current={path === "/" ? "page" : undefined}
      >
        {/* A plain <img>: the SVG needs no optimisation, and next/image
            would add client JavaScript for nothing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={header.logoAlt}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
      </a>
      <nav className={styles.nav} aria-label="Main">
        <NavLinks path={path} className={styles.links} />
        <a
          className={styles.github}
          href={header.github.href}
          data-goatcounter-click="github-cta"
        >
          <Icon name="mark-github" />
          <span className={styles.visuallyHidden}>{header.github.label}</span>
        </a>
        {downloads ? (
          <DownloadMenu downloads={downloads} current={downloadCurrent} />
        ) : (
          <Button
            variant="nav"
            href={header.download.href}
            current={downloadCurrent}
          >
            {header.download.label}
          </Button>
        )}
        <details className={styles.menu} name={MENU_GROUP}>
          <summary className={styles.menuButton}>
            <Icon name="three-bars" className={styles.iconOpen} />
            <Icon name="x" className={styles.iconClose} />
            {header.menu}
          </summary>
          <NavLinks path={path} className={styles.panel} />
        </details>
      </nav>
    </header>
  );
}
