import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

const COMPONENTS: Components = {
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

/**
 * Renders one paragraph of derived Markdown without its `<p>`, for text that
 * sits inside an element of its own (the footer's canonical definition).
 * Separate from `<Markdown>` so pages that only need inline text never load
 * the Code block's client code.
 */
export function InlineMarkdown({ source }: { source: string }) {
  return <ReactMarkdown components={COMPONENTS}>{source}</ReactMarkdown>;
}
