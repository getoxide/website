/**
 * The visible text of a line of derived Markdown: emphasis, code marks and
 * link targets dropped. Only the inline syntax the Oxide README uses.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\w])[*_]([^*_]+)[*_](?=[^\w]|$)/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** The cells of each body row of a Markdown table. */
export function tableRows(markdown: string): string[][] {
  return markdown
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .slice(2)
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((c) => plainText(c)),
    );
}
