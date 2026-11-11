import type { Page } from "@/content/pages";
import { SNAPSHOT } from "@/lib/snapshot";
import { serializeJsonLd, structuredDataFor } from "@/lib/structured-data";

/**
 * The JSON-LD of one page (Machine-readable layer #14, decisions 5-6),
 * rendered by `SiteFrame` so every page gets its registry entry's type. The
 * home carries the one @graph; every other page a WebPage (TechArticle for
 * guides and docs) or, on /faq, the FAQPage.
 */
export function StructuredData({ page }: { page: Page }) {
  const data = structuredDataFor(page, SNAPSHOT);
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
