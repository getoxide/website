// Concept links in derived Markdown (Content #12 addendum, point 4; Copy deck
// rule 4): the first capitalised mention of each Concepts term on a page links
// to `/docs/concepts#<term>`. A page renders its Markdown sources in order and
// gives each one the terms already mentioned before it (`seenBefore`), so the
// links land on the page's first mentions. `pnpm check:concept-links`
// enforces the rule on the export and matches mentions the same way.
import type { Link, Parent, PhrasingContent, Root, Text } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { SNAPSHOT, type Concept } from "./snapshot";

const CONCEPTS_PATH = "/docs/concepts";

type Term = Pick<Concept, "term" | "id">;

/** Nodes whose text is never a mention. */
const NOT_PROSE = new Set(["code", "inlineCode", "html"]);
/** Nodes that are links already: a mention inside is never linked again. */
const LINKS = new Set(["link", "linkReference"]);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole-word, case-sensitive, plural and compounds ("per-Turn") included. */
const mentionOf = (term: string) =>
  new RegExp(`(?<!\\w)${escape(term)}s?(?!\\w)`);

/** The earliest mention in `text` of a term not seen yet. */
function firstMention(text: string, concepts: Term[], seen: Set<string>) {
  let first: { index: number; match: string; concept: Term } | null = null;
  for (const concept of concepts) {
    if (seen.has(concept.term)) continue;
    const m = mentionOf(concept.term).exec(text);
    if (m && (!first || m.index < first.index)) {
      first = { index: m.index, match: m[0], concept };
    }
  }
  return first;
}

/**
 * Walks a Markdown tree in reading order, adding every term it mentions to
 * `seen`; with `link`, the first mention of each unseen term becomes a link.
 */
function visit(
  node: Parent,
  concepts: Term[],
  seen: Set<string>,
  link: boolean,
) {
  const children: Parent["children"] = [];
  for (const child of node.children) {
    if (child.type !== "text") {
      if ("children" in child && !NOT_PROSE.has(child.type)) {
        visit(child, concepts, seen, link && !LINKS.has(child.type));
      }
      children.push(child);
      continue;
    }
    let rest = (child as Text).value;
    for (;;) {
      const hit = firstMention(rest, concepts, seen);
      if (!hit) break;
      seen.add(hit.concept.term);
      if (!link) continue;
      const anchor: Link = {
        type: "link",
        url: `${CONCEPTS_PATH}#${hit.concept.id}`,
        children: [{ type: "text", value: hit.match }],
      };
      const before = rest.slice(0, hit.index);
      if (before) children.push({ type: "text", value: before });
      children.push(anchor as PhrasingContent);
      rest = rest.slice(hit.index + hit.match.length);
    }
    if (rest) children.push({ type: "text", value: rest });
  }
  node.children = children;
}

/**
 * Remark plugin: links the first mention of each Concepts term in the
 * document, except the terms in `seen` (already mentioned earlier on the page).
 */
export function remarkConceptLinks({
  seen,
  concepts = SNAPSHOT.concepts,
}: {
  seen: ReadonlySet<string>;
  concepts?: Term[];
}) {
  return (tree: Root) => visit(tree, concepts, new Set(seen), true);
}

/** The Concepts terms a Markdown source mentions outside code. */
function mentioned(source: string, concepts: Term[]): Set<string> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source);
  const seen = new Set<string>();
  visit(structuredClone(tree), concepts, seen, false);
  return seen;
}

/**
 * Every term mentioned in these Markdown sources (plus `initial`): what a
 * block rendered after them, like the closing CTA, has already seen.
 */
export function mentionedIn(
  sources: string[],
  initial: Iterable<string> = [],
  concepts: Term[] = SNAPSHOT.concepts,
): ReadonlySet<string> {
  const seen = new Set(initial);
  for (const source of sources) {
    for (const term of mentioned(source, concepts)) seen.add(term);
  }
  return seen;
}

/**
 * For Markdown sources rendered in this order on one page, the terms already
 * mentioned before each one (plus `initial`, e.g. headings shown earlier).
 */
export function seenBefore(
  sources: string[],
  initial: Iterable<string> = [],
  concepts: Term[] = SNAPSHOT.concepts,
): ReadonlySet<string>[] {
  const seen = new Set(initial);
  return sources.map((source) => {
    const before = new Set(seen);
    for (const term of mentioned(source, concepts)) seen.add(term);
    return before;
  });
}
