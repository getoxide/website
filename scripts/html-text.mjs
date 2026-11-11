// Visible text of exported HTML, for the copy gates (copy-lint, concept
// links). Scripts, styles and hidden elements are not visible text, so the
// inline RSC payload and attribute values (`href`s) never count.
import { parse } from "parse5";

export { parse };

/** Elements whose content is never visible text. */
const INVISIBLE = new Set(["head", "script", "style", "template", "noscript"]);

/** Elements that break the text flow: their text never runs into a neighbour's. */
const BLOCK = new Set(
  "address article aside blockquote br dd details div dl dt figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section summary table tbody td tfoot th thead tr ul".split(
    " ",
  ),
);

/** Marks a block boundary in extracted text. */
export const BREAK = "\u0000";

export const attrOf = (node, name) =>
  node.attrs?.find((a) => a.name === name)?.value ?? null;

export const normalize = (text) => text.replace(/[\s\u0000]+/g, " ").trim();

/** Whether a node's content is never visible. */
export const isInvisible = (node) =>
  INVISIBLE.has(node.nodeName) || attrOf(node, "hidden") !== null;

/** Whether a node starts and ends a block of text. */
export const isBlock = (node) => BLOCK.has(node.nodeName);

/**
 * The visible text of a node, blocks separated by `BREAK`.
 * @param {(node: object) => boolean} [skip] subtrees to leave out
 */
export function textOf(node, skip = () => false) {
  if (node.nodeName === "#text") return node.value;
  if (isInvisible(node)) return "";
  if (skip(node)) return BREAK;
  const children = node.content ?? node;
  const inner = (children.childNodes ?? [])
    .map((c) => textOf(c, skip))
    .join("");
  return isBlock(node) ? `${BREAK}${inner}${BREAK}` : inner;
}

/** The visible text of a node as its blocks (paragraphs, list items...). */
export const blocksOf = (node, skip) =>
  textOf(node, skip).split(BREAK).map(normalize).filter(Boolean);

/** Every element of a tree, depth first. */
export function* elements(node) {
  for (const child of node.childNodes ?? []) {
    if (child.tagName) {
      yield child;
      yield* elements(child);
    }
  }
}
