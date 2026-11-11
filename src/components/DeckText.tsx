import type { ReactNode } from "react";
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from "react-markdown";
import { remarkConceptLinks } from "@/lib/concept-links";
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
 * @param conceptLinks in main content, the Concepts terms already mentioned
 *   earlier on the page (`seenBefore`): the first mention of every other term
 *   links to its Concept (Copy deck rule 4: that link is the build's job)
 */
export function DeckText({
  source,
  conceptLinks,
}: {
  source: string;
  conceptLinks?: ReadonlySet<string>;
}) {
  return (
    <ReactMarkdown
      components={COMPONENTS}
      urlTransform={urlTransform}
      remarkPlugins={
        conceptLinks ? [[remarkConceptLinks, { seen: conceptLinks }]] : []
      }
    >
      {source}
    </ReactMarkdown>
  );
}
