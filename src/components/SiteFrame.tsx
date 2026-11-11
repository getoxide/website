import type { ReactNode } from "react";
import type { Page } from "@/content/pages";
import { SiteHeader } from "./SiteHeader";
import styles from "./SiteFrame.module.css";

/**
 * Header, main landmark and footer around a page's content. Every page
 * renders it with its PAGES entry: the root layout cannot know which page it
 * wraps without client JavaScript, and the header needs the path to mark the
 * current link and to sit over the hero on the home.
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
      <SiteHeader path={page.path} />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer} />
    </>
  );
}
