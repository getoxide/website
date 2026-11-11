import type { ReactNode } from "react";
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

/** Inline mode drops the paragraph, for a definition inside a `<p>`. */
const INLINE: Components = {
  ...COMPONENTS,
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

/**
 * Renders derived Markdown from the Snapshot (GitHub-flavoured: tables) to
 * static HTML at build time. Raw HTML in the source is not rendered. Style it
 * by wrapping it in `<Prose>`.
 */
export function Markdown({
  source,
  inline = false,
}: {
  source: string;
  inline?: boolean;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={inline ? INLINE : COMPONENTS}
    >
      {source}
    </ReactMarkdown>
  );
}
