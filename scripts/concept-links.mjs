// `pnpm check:concept-links`: on every exported page, the first capitalised
// mention of each Concepts term in the main content links to
// `/docs/concepts#<term>` (Content #12 addendum, point 4; Copy deck rule 4).
// Authors place the links (components, and `remarkConceptLinks` for derived
// Markdown); this gate enforces the rule.
import { fileURLToPath } from "node:url";
import {
  OUT_DIR,
  exportedPages,
  registry,
  snapshot,
} from "./exported-pages.mjs";
import {
  BREAK,
  attrOf,
  elements,
  isBlock,
  isInvisible,
  normalize,
  parse,
} from "./html-text.mjs";

const CONCEPTS_PATH = "/docs/concepts";
/** Text in these elements is code, not prose: never a mention. */
const CODE = new Set(["code", "pre", "kbd", "samp"]);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A whole-word, case-sensitive mention of a term, plural and compounds
 * ("per-Turn") included. `src/lib/concept-links.ts` matches the same way.
 */
export const mentionOf = (term) =>
  new RegExp(`(?<!\\w)${escape(term)}s?(?!\\w)`, "g");

/**
 * The text of the main content, flattened, with for each character the
 * context it sits in: the link around it, whether it is code, and the ids of
 * its ancestors. Blocks are separated by `BREAK`.
 */
function flatten(main) {
  let text = "";
  const owners = [];
  const push = (chunk, owner) => {
    text += chunk;
    for (let i = 0; i < chunk.length; i++) owners.push(owner);
  };
  const walk = (node, ctx) => {
    if (node.nodeName === "#text") return push(node.value, ctx);
    if (!node.tagName || isInvisible(node)) return;
    const id = attrOf(node, "id");
    const inner = {
      href: node.nodeName === "a" ? attrOf(node, "href") : ctx.href,
      code: ctx.code || CODE.has(node.nodeName),
      ids: id ? [...ctx.ids, id] : ctx.ids,
    };
    if (isBlock(node)) push(BREAK, null);
    for (const child of (node.content ?? node).childNodes ?? []) {
      walk(child, inner);
    }
    if (isBlock(node)) push(BREAK, null);
  };
  walk(main, { href: null, code: false, ids: [] });
  return { text, owners };
}

/** The block of flattened text around a position, normalized. */
function blockAt(text, index) {
  const start = text.lastIndexOf(BREAK, index) + 1;
  const end = text.indexOf(BREAK, index);
  return normalize(text.slice(start, end === -1 ? undefined : end));
}

/**
 * @param {{ path: string, html: string, concepts: { term: string, id: string }[] }} page
 *   `concepts` is the Concepts allowlist from the Snapshot.
 * @returns {string[]} one line per unlinked first mention
 */
export function checkConceptLinks({ path, html, concepts }) {
  const main = [...elements(parse(html))].find((el) => el.nodeName === "main");
  if (!main) return [];
  const { text, owners } = flatten(main);
  const violations = [];
  for (const { term, id } of concepts) {
    const first = [...text.matchAll(mentionOf(term))].find(
      (m) => !owners[m.index].code,
    );
    if (!first) continue;
    const { href, ids } = owners[first.index];
    const target = href ? new URL(href, `http://x${path}`) : null;
    const linked =
      target?.pathname === CONCEPTS_PATH && target.hash === `#${id}`;
    const isOwnHeading = path === CONCEPTS_PATH && ids.includes(id);
    if (!linked && !isOwnHeading) {
      violations.push(
        `${path}: the first mention of "${term}" is not a link to ${CONCEPTS_PATH}#${id}, in "${blockAt(text, first.index)}"`,
      );
    }
  }
  return violations;
}

async function main() {
  const { concepts } = await snapshot();
  const pages = exportedPages(OUT_DIR, await registry());
  const violations = pages.flatMap(({ path, html }) =>
    checkConceptLinks({ path, html, concepts }),
  );
  if (violations.length > 0) {
    console.error(
      "Concept links failed (Content #12 addendum, point 4; Copy deck rule 4):",
    );
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(`Concept links passed: ${pages.length} pages.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
