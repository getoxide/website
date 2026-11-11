import { Fragment } from "react";
import { COPY, type Link } from "@/content/copy";
import { isCurrent } from "@/lib/nav";
import { LICENCE_URL } from "@/lib/oxide";
import { token } from "@/lib/snapshot";
import { Markdown } from "./Markdown";
import styles from "./SiteFooter.module.css";

function FooterLink({ link, path }: { link: Link; path: string }) {
  return (
    <a
      className={styles.link}
      href={link.href}
      aria-current={isCurrent(link.href, path) ? "page" : undefined}
    >
      {link.label}
    </a>
  );
}

const headingId = (heading: string) =>
  `footer-${heading.toLowerCase().replace(/\s+/g, "-")}`;

/**
 * The site footer (Design system, Footer; Page inventory, Footer): the
 * canonical definition, three link columns, then the trust line, the repo,
 * the disclaimers and the credits. The definition renders from the Snapshot
 * here and only here, so it is verbatim on every page by construction
 * (Copy #18, Canonical definition placement).
 */
export function SiteFooter({ path }: { path: string }) {
  const { footer } = COPY;
  const meta: Link[] = [
    footer.repo,
    footer.privacy,
    { label: footer.licence, href: LICENCE_URL },
  ];
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.definition} data-testid="definition">
          <Markdown source={token("definition")!} inline />
        </p>
        <div className={styles.columns}>
          {footer.columns.map((column) => (
            <div key={column.heading}>
              <h2 id={headingId(column.heading)} className={styles.heading}>
                {column.heading}
              </h2>
              <ul
                className={styles.list}
                aria-labelledby={headingId(column.heading)}
              >
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink link={link} path={path} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.lines}>
          <p className={styles.trust}>{footer.trustLine}</p>
          <p className={styles.meta}>
            {meta.map((link, i) => (
              <Fragment key={link.href}>
                {i > 0 ? <span aria-hidden="true"> · </span> : null}
                <FooterLink link={link} path={path} />
              </Fragment>
            ))}
          </p>
          <p>{footer.notAffiliated}</p>
          <p>{footer.trademarks}</p>
          <p>
            <FooterLink link={footer.madeBy} path={path} />
          </p>
        </div>
      </div>
    </footer>
  );
}
