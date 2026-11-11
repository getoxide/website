import { PAGES, type Page } from "../src/content/pages";

/** An unknown path, served the 404 page. */
export const UNKNOWN_PATH = "/this-page-does-not-exist";

/** Where to open a registry entry in the browser. */
export function urlOf(page: Page): string {
  return page.path === "/404" ? UNKNOWN_PATH : page.path;
}

export const REGISTERED: Page[] = Object.values(PAGES);
