// `pnpm check:copy`: copy-lint over the visible text of every exported page
// (Copy #18, Checks; Copy deck, Rules every string here follows, 1-3). The
// visible text is the page body without scripts, styles and hidden elements,
// so the inline RSC payload and `href`s never count.
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

/** Elements whose content is never visible text. */
const INVISIBLE = new Set(["head", "script", "style", "template", "noscript"]);

/** Elements that break the text flow: their text never runs into a neighbour's. */
const BLOCK = new Set(
  "address article aside blockquote br dd details div dl dt figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section summary table tbody td tfoot th thead tr ul".split(
    " ",
  ),
);

const attrOf = (node, name) =>
  node.attrs?.find((a) => a.name === name)?.value ?? null;

const normalize = (text) => text.replace(/\s+/g, " ").trim();

/** The visible text of a node, optionally leaving out some subtrees. */
function textOf(node, skip = () => false) {
  if (node.nodeName === "#text") return node.value;
  if (INVISIBLE.has(node.nodeName) || attrOf(node, "hidden") !== null) {
    return "";
  }
  if (skip(node)) return " ";
  const children = node.content ?? node;
  const inner = (children.childNodes ?? [])
    .map((c) => textOf(c, skip))
    .join("");
  return BLOCK.has(node.nodeName) ? ` ${inner} ` : inner;
}

/** Every element of a tree, depth first. */
function* elements(node) {
  for (const child of node.childNodes ?? []) {
    if (child.tagName) {
      yield child;
      yield* elements(child);
    }
  }
}

/** The visible text of a line of Markdown: marks and link targets dropped. */
export function markdownText(markdown) {
  return normalize(
    markdown
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(^|[^\w])[*_]([^*_]+)[*_](?=[^\w]|$)/g, "$1$2")
      .replace(/`([^`]*)`/g, "$1"),
  );
}

/**
 * @param {{ path: string, html: string, definition: string }} page
 *   `definition` is the Snapshot's canonical definition, Markdown.
 * @returns {string[]} one line per broken rule, empty when the copy is clean
 */
export function lintCopy({ path, html, definition }) {
  const violations = [];
  const document = parse(html);
  const text = normalize(textOf(document));
  const canonical = markdownText(definition);

  // Rule 1: every page carries the definition, and wherever it appears
  // (every element marked as the definition) it is the Snapshot's text.
  if (!text.includes(canonical)) {
    violations.push(
      `${path}: the canonical definition from the Snapshot is missing`,
    );
  }
  for (const el of elements(document)) {
    if (attrOf(el, "data-testid") !== "definition") continue;
    const shown = normalize(textOf(el));
    if (shown !== canonical) {
      violations.push(
        `${path}: a definition differs from the Snapshot's: "${shown}"`,
      );
    }
  }
  return violations;
}
