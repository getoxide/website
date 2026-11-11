import { COPY } from "@/content/copy";
import styles from "./DocsNav.module.css";

/** The two-link docs sub-nav (Design system, Prose): no sidebar, no TOC. */
export function DocsNav({ path }: { path: string }) {
  const { label, links } = COPY.docs.nav;
  return (
    <nav className={styles.nav} aria-label={label}>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <a
              className={styles.link}
              href={link.href}
              aria-current={link.href === path ? "page" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
