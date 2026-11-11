import type { ReactNode } from "react";
import type { Page } from "@/content/pages";
import { ClosingCta } from "./ClosingCta";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import styles from "./SiteFrame.module.css";

/**
 * Header, main landmark and footer around a page's content. Every page
 * renders it with its PAGES entry: the root layout cannot know which page it
 * wraps without client JavaScript, and the header needs the path to mark the
 * current link and to sit over the hero on the home. Every page but
 * `/download` ends with the closing CTA block.
 * @param conceptsSeen the Concepts terms the page's content mentions
 *   (`mentionedIn`), so the closing CTA links only the ones it mentions first
 */
export function SiteFrame({
  page,
  conceptsSeen,
  children,
}: {
  page: Page;
  conceptsSeen?: ReadonlySet<string>;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader path={page.path} />
      <main id="main" className={styles.main}>
        {children}
        {/* Page inventory #9, internal linking rule 1. */}
        {page.path === "/download" ? null : (
          <ClosingCta conceptsSeen={conceptsSeen} />
        )}
      </main>
      <SiteFooter path={page.path} />
    </>
  );
}
