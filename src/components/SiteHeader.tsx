import logo from "../../content/oxide/brand/oxide-logo.svg";
import { COPY, type Link } from "@/content/copy";
import { isCurrent } from "@/lib/nav";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./SiteHeader.module.css";

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
 * The site header (Design system, Header). Not sticky. On the home it sits
 * transparent over the hero; elsewhere it is in flow with a bottom border.
 * Below 860px the four links move into a `<details>` menu, which opens and
 * closes without JavaScript; the Download button stays visible.
 */
export function SiteHeader({ path }: { path: string }) {
  const { header } = COPY;
  const overlay = path === "/";
  return (
    <header
      className={`${styles.header} ${overlay ? styles.overlay : styles.inFlow}`}
    >
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
        <a className={styles.github} href={header.github.href}>
          <Icon name="mark-github" />
          <span className={styles.visuallyHidden}>{header.github.label}</span>
        </a>
        <Button
          variant="nav"
          href={header.download.href}
          current={isCurrent(header.download.href, path)}
        >
          {header.download.label}
        </Button>
        <details className={styles.menu}>
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
