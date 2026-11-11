import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";
import { remarkConceptLinks } from "@/lib/concept-links";
import { CodeBlock } from "./CodeBlock";

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: { className?: unknown };
  children?: HastNode[];
};

const textOf = (node: HastNode): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("");

/** Fenced code goes through the Code block, highlighted at build time. */
const pre: Components["pre"] = ({ node }) => {
  const code = (node as HastNode | undefined)?.children?.find(
    (c) => c.tagName === "code",
  );
  const classes = code?.properties?.className;
  const lang = (Array.isArray(classes) ? classes : [])
    .map(String)
    .find((c) => c.startsWith("language-"))
    ?.slice("language-".length);
  return (
    <CodeBlock code={code ? textOf(code).replace(/\n$/, "") : ""} lang={lang} />
  );
};

const COMPONENTS: Components = { pre };

/**
 * Renders derived Markdown from the Snapshot (GitHub-flavoured: tables) to
 * static HTML at build time. Raw HTML in the source is not rendered. Style it
 * by wrapping it in `<Prose>`; for a single inline paragraph use
 * `<InlineMarkdown>`.
 * @param conceptLinks in main content, the Concepts terms already mentioned
 *   earlier on the page (`seenBefore`): the first mention of every other term
 *   links to its Concept (Content #12 addendum, point 4)
 */
export function Markdown({
  source,
  conceptLinks,
}: {
  source: string;
  conceptLinks?: ReadonlySet<string>;
}) {
  const plugins: PluggableList = conceptLinks
    ? [remarkGfm, [remarkConceptLinks, { seen: conceptLinks }]]
    : [remarkGfm];
  return (
    <ReactMarkdown remarkPlugins={plugins} components={COMPONENTS}>
      {source}
    </ReactMarkdown>
  );
}
