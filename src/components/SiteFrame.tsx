import type { ReactNode } from "react";
import type { Page } from "@/content/pages";
import { ClosingCta } from "./ClosingCta";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StructuredData } from "./StructuredData";
import styles from "./SiteFrame.module.css";

/**
 * Header, main landmark and footer around a page's content. Every page
 * renders it with its PAGES entry: the root layout cannot know which page it
 * wraps without client JavaScript, and the header needs the path to mark the
 * current link and to sit over the hero on the home. Every page but
 * `/download` ends with the closing CTA block.
 */
export function SiteFrame({
  page,
  children,
}: {
  page: Page;
  children: ReactNode;
}) {
  return (
    <>
      <StructuredData page={page} />
      <SiteHeader path={page.path} />
      <main id="main" className={styles.main}>
        {children}
        {/* Page inventory #9, internal linking rule 1. */}
        {page.path === "/download" ? null : <ClosingCta />}
      </main>
      <SiteFooter path={page.path} />
    </>
  );
}
