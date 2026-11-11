// `pnpm check:copy`: copy-lint over the visible text of every exported page
// (Copy #18, Checks; Copy deck, Rules every string here follows, 1-3). The
// visible text is the page body without scripts, styles and hidden elements,
// so the inline RSC payload and `href`s never count.
import { fileURLToPath } from "node:url";
import { parse } from "parse5";
import {
  OUT_DIR,
  exportedPages,
  registry,
  snapshot,
} from "./exported-pages.mjs";

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

/** Marks a block boundary in extracted text. */
const BREAK = "\u0000";

const normalize = (text) => text.replace(/[\s\u0000]+/g, " ").trim();

/** The visible text of a node as its blocks (paragraphs, list items...). */
const blocksOf = (node, skip) =>
  textOf(node, skip).split(BREAK).map(normalize).filter(Boolean);

/** The visible text of a node, optionally leaving out some subtrees. */
function textOf(node, skip = () => false) {
  if (node.nodeName === "#text") return node.value;
  if (INVISIBLE.has(node.nodeName) || attrOf(node, "hidden") !== null) {
    return "";
  }
  if (skip(node)) return BREAK;
  const children = node.content ?? node;
  const inner = (children.childNodes ?? [])
    .map((c) => textOf(c, skip))
    .join("");
  return BLOCK.has(node.nodeName) ? `${BREAK}${inner}${BREAK}` : inner;
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

/**
 * Banned phrases (Copy #18 rule 2; Copy deck rules 2 and 6), matched
 * case-insensitively on whole words within one block of visible text.
 */
export const BANNED = [
  ["10x", /\b10\s?[x×](?!\w)/i],
  ["magic", /\bmagic(?:al|ally)?\b/i],
  ["army of agents", /\barmy of agents\b/i],
  ["the only", /\bthe only\b/i],
  ["agentic engineering", /\bagentic engineering\b/i],
  ["senior", /\bseniors?\b/i],
  ["write code with Oxide", /\bwrit(?:e|es|ing)\s+code\s+with\s+Oxide\b/i],
  [
    "code with Oxide",
    /(?<!\bwrit(?:e|es|ing)\s+)\bcod(?:e|es|ing)\s+with\s+Oxide\b/i,
  ],
  [
    "Oxide writes code",
    /\bOxide\s+(?:writes|will\s+write|generates)\s+(?:the\s+|your\s+)?code\b/i,
  ],
  ["the most complete", /\bthe most complete\b/i],
  ["the best", /\bthe best\b/i],
  // Not bare "the main", which would match "the main branch".
  ["the main app", /\bthe main app\b/i],
];

/** Pages where "GUI" may appear anywhere (Copy deck rule 3). */
const GUI_PAGES = new Set(["/claude-code-gui", "/codex-gui"]);
/** The derived answer on /faq where "GUI" may appear (Copy deck rule 3). */
const GUI_FAQ = { path: "/faq", section: "what-is-oxide" };
const GUI = /\bGUIs?\b/i;

/**
 * Temporary exception to the GUI rule, tracked in getoxide/oxide#416.
 *
 * The canonical definition is Derived from the Oxide README and may not be
 * reworded (Copy deck rule 1), yet it says "desktop GUI" and renders in the
 * footer of every page. getoxide/oxide#416 rewrites it without "GUI". Until
 * then, this exact Snapshot text, and only it, may say "GUI" outside the
 * three places of rule 3. Any other definition text, including the next one
 * from the Snapshot, gets no exception: when #416 lands and `pnpm sync:oxide`
 * brings the new text, delete this constant (`pnpm check:copy` warns when it
 * no longer matches the Snapshot).
 */
export const GUI_EXCEPTION_DEFINITION =
  "Oxide is a free, open-source **desktop GUI for AI coding agents**, built with Rust and [Tauri](https://tauri.app). It doesn't ship an agent of its own: it drives the agent CLIs you already have installed and logged in (**Claude Code**, **OpenAI Codex** and **Antigravity CLI**) and puts Git, GitHub, a code editor and a terminal around the conversation.";

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

  // Rule 2: no banned phrase.
  for (const block of blocksOf(document)) {
    for (const [phrase, pattern] of BANNED) {
      if (pattern.test(block)) {
        violations.push(`${path}: banned phrase "${phrase}" in "${block}"`);
      }
    }
  }

  // Rule 3: "GUI" only on the Provider landing pages and in one FAQ answer.
  if (!GUI_PAGES.has(path)) {
    const skip = (node) =>
      path === GUI_FAQ.path &&
      attrOf(node, "aria-labelledby") === GUI_FAQ.section;
    const exempt = definition === GUI_EXCEPTION_DEFINITION ? canonical : null;
    for (const block of blocksOf(document, skip)) {
      const checked = exempt ? block.replaceAll(exempt, "") : block;
      if (GUI.test(checked)) {
        violations.push(
          `${path}: "GUI" outside /claude-code-gui, /codex-gui and /faq#what-is-oxide in "${block}"`,
        );
      }
    }
  }
  return violations;
}

async function main() {
  const { definition } = (await snapshot()).readme;
  const pages = exportedPages(OUT_DIR, await registry());
  const violations = pages.flatMap(({ path, html }) =>
    lintCopy({ path, html, definition }),
  );
  if (definition !== GUI_EXCEPTION_DEFINITION) {
    console.warn(
      "Warning: the Snapshot's definition no longer matches GUI_EXCEPTION_DEFINITION in scripts/copy-lint.mjs, so the getoxide/oxide#416 exception no longer applies: delete it.",
    );
  }
  if (violations.length > 0) {
    console.error(
      "copy-lint failed (Copy deck, Rules every string here follows):",
    );
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(`copy-lint passed: ${pages.length} pages.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
