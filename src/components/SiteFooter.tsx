import { Fragment } from "react";
import { COPY, type Link } from "@/content/copy";
import { isCurrent } from "@/lib/nav";
import { LICENCE_URL } from "@/lib/oxide";
import { token } from "@/lib/snapshot";
import logo from "../../content/oxide/brand/oxide-logo.svg";
import { InlineMarkdown } from "./InlineMarkdown";
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
 * The site footer (Design system, Footer; Page inventory, Footer): the logo,
 * the canonical definition and the trust line beside three link columns,
 * then, under a hairline, the repo, the credits and the disclaimers. The definition renders from the Snapshot
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
  const { madeBy } = footer;
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {/* Decorative: the definition beside it starts with the name.
                A plain <img>, as in the header. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.logo}
              src={logo.src}
              alt=""
              width={68}
              height={23}
            />
            <p className={styles.definition} data-testid="definition">
              <InlineMarkdown source={token("definition")!} />
            </p>
            <p className={styles.trust}>{footer.trustLine}</p>
          </div>
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
        </div>
        <div className={styles.bottom}>
          <p className={styles.meta}>
            {meta.map((link, i) => (
              <Fragment key={link.href}>
                {i > 0 ? <span aria-hidden="true"> · </span> : null}
                <FooterLink link={link} path={path} />
              </Fragment>
            ))}
          </p>
          <p className={styles.credits}>
            {madeBy.lead}{" "}
            {madeBy.authors.map((author, i) => (
              <Fragment key={author.href}>
                {i > 0 ? ` ${madeBy.and} ` : null}
                <FooterLink link={author} path={path} />
              </Fragment>
            ))}
          </p>
          <div className={styles.disclaimers}>
            <p>{footer.notAffiliated}</p>
            <p>{footer.trademarks}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
