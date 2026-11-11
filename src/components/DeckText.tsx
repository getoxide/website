import type { ReactNode } from "react";
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from "react-markdown";
import { readmeUrl } from "@/lib/oxide";

const README = "README#";

/** `README#anchor` is that README section on GitHub at the pinned ref. */
function urlTransform(url: string): string {
  return url.startsWith(README)
    ? readmeUrl(url.slice(README.length))
    : defaultUrlTransform(url);
}

const COMPONENTS: Components = {
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

/**
 * One line of site copy in the Copy deck's notation, rendered at build time
 * without its `<p>`: `[label](target)` links (a `README#…` target points at
 * the README at the pinned ref), `` `code` `` and `**bold**`. The deck string
 * stays verbatim in `COPY`, so it can be compared with the deck.
 */
export function DeckText({ source }: { source: string }) {
  return (
    <ReactMarkdown components={COMPONENTS} urlTransform={urlTransform}>
      {source}
    </ReactMarkdown>
  );
}
