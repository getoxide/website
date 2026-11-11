// Collections nest their pages under one segment (Page inventory, URL
// scheme): a link into a collection stands for every page in it.
const COLLECTIONS = ["docs", "guides"];

function collectionOf(path: string): string | null {
  const first = path.split("/")[1];
  return COLLECTIONS.includes(first) ? first : null;
}

/**
 * Whether a site link points at the page being viewed, and so carries
 * `aria-current="page"` (Design system, Header).
 * @param href the link target
 * @param path the URL path of the page being viewed, no trailing slash
 */
export function isCurrent(href: string, path: string): boolean {
  if (!href.startsWith("/")) return false;
  if (href === path) return true;
  const collection = collectionOf(href);
  return collection !== null && collection === collectionOf(path);
}
