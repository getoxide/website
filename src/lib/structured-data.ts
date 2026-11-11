// JSON-LD (Machine-readable layer #14, decisions 3-6): one @graph on the
// home naming the site, the organization and the app; a minimal WebPage or
// TechArticle on every other page, linked to both; a FAQPage only on /faq,
// built from the same README list the page renders. Never a rating or review:
// Google's SoftwareApplication rich result asks for one, and Oxide has none.
import { SITE_URL, type Page } from "../content/pages";
import { faqOf, type FaqEntry } from "./faq";
import { markdownText } from "./markdown-text";
import { LICENCE_URL, OXIDE } from "./oxide";
import type { Snapshot } from "./snapshot";

type JsonLd = Record<string, unknown>;

const REPO_URL = `https://github.com/${OXIDE.repo}`;
const ORG_URL = `https://github.com/getoxide`;
const FOUNDER_URL = "https://cavallinilorenzo.com";

/** Schema.org application category of a desktop developer tool. */
const APPLICATION_CATEGORY = "DeveloperApplication";
/** Machine-readable layer #14, decision 6. */
const OPERATING_SYSTEM = "macOS (Apple Silicon), Windows 10/11 x64";

const ids = (siteUrl: string) => ({
  website: `${siteUrl}/#website`,
  organization: `${siteUrl}/#organization`,
  software: `${siteUrl}/#software`,
});

const titleOf = (page: Page) => page.title.replace(/ · Oxide$/, "");

const webSite = (siteUrl: string): JsonLd => ({
  "@type": "WebSite",
  "@id": ids(siteUrl).website,
  url: siteUrl,
  name: "Oxide",
  alternateName: ["getoxide", "Oxide app"],
  inLanguage: "en",
  publisher: { "@id": ids(siteUrl).organization },
});

const organization = (siteUrl: string): JsonLd => ({
  "@type": "Organization",
  "@id": ids(siteUrl).organization,
  name: "Oxide",
  alternateName: "getoxide",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  sameAs: [ORG_URL],
  founder: {
    "@type": "Person",
    name: "Lorenzo Cavallini",
    url: FOUNDER_URL,
  },
});

const softwareApplication = (snapshot: Snapshot, siteUrl: string): JsonLd => {
  const stable =
    snapshot.release.state === "stable" ? snapshot.release.latest : null;
  return {
    "@type": "SoftwareApplication",
    "@id": ids(siteUrl).software,
    name: "Oxide",
    description: markdownText(snapshot.readme.definition),
    applicationCategory: APPLICATION_CATEGORY,
    operatingSystem: OPERATING_SYSTEM,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    license: LICENCE_URL,
    downloadUrl: `${siteUrl}/download`,
    sameAs: [REPO_URL],
    ...(stable ? { softwareVersion: stable.version } : {}),
  };
};

/** The home's one @graph, with stable ids. */
export function homeGraph(snapshot: Snapshot, siteUrl = SITE_URL): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webSite(siteUrl),
      organization(siteUrl),
      softwareApplication(snapshot, siteUrl),
    ],
  };
}

/** A minimal WebPage node; guides and docs pages are TechArticles. */
export function webPageNode(page: Page, siteUrl = SITE_URL): JsonLd {
  const article = page.structuredData === "TechArticle";
  return {
    "@context": "https://schema.org",
    "@type": article ? "TechArticle" : "WebPage",
    "@id": `${siteUrl}${page.path === "/" ? "" : page.path}#webpage`,
    url: siteUrl + (page.path === "/" ? "" : page.path),
    name: titleOf(page),
    ...(article ? { headline: page.h1 } : {}),
    description: page.description,
    inLanguage: "en",
    isPartOf: { "@id": ids(siteUrl).website },
    about: { "@id": ids(siteUrl).software },
  };
}

/** The FAQPage on /faq, from the same list the page renders. */
export function faqPageNode(
  page: Page,
  entries: readonly FaqEntry[],
  siteUrl = SITE_URL,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}${page.path}#webpage`,
    url: `${siteUrl}${page.path}`,
    name: titleOf(page),
    description: page.description,
    inLanguage: "en",
    isPartOf: { "@id": ids(siteUrl).website },
    about: { "@id": ids(siteUrl).software },
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: markdownText(entry.answer),
      },
    })),
  };
}

/** The JSON-LD a registry page carries, or null for the 404. */
export function structuredDataFor(
  page: Page,
  snapshot: Snapshot,
  siteUrl = SITE_URL,
): JsonLd | null {
  switch (page.structuredData) {
    case "HomeGraph":
      return homeGraph(snapshot, siteUrl);
    case "WebPage":
    case "TechArticle":
      return webPageNode(page, siteUrl);
    case "FAQPage":
      return faqPageNode(page, faqOf(snapshot), siteUrl);
    default:
      return null;
  }
}

/**
 * JSON for a `<script type="application/ld+json">`. `<` is escaped so a
 * string can never close the script element; the result stays valid JSON.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export { markdownText };
