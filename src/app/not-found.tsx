import { Fragment } from "react";
import { PageHeader } from "@/components/PageHeader";
import { COPY } from "@/content/copy";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";
import styles from "./not-found.module.css";

// Next already adds `<meta name="robots" content="noindex">` to the 404.
export const metadata = { ...pageMetadata(PAGES.notFound), robots: undefined };

export default function NotFound() {
  const { sentence, links } = COPY.notFound;
  return (
    <div className={styles.page}>
      <PageHeader title={PAGES.notFound.h1} lead={sentence} />
      <p className={styles.links}>
        {links.map((link, i) => (
          <Fragment key={link.href}>
            {i > 0 ? <span aria-hidden="true"> · </span> : null}
            <a href={link.href}>{link.label}</a>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
