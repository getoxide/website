import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
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
 */
export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {source}
    </ReactMarkdown>
  );
}
