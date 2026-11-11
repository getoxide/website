import type { Metadata } from "next";
import { SITE_URL, type Page } from "@/content/pages";
import { shareCardOpenGraph, shareCardTwitter } from "@/lib/share";

const SUFFIX = " · Oxide";

/** Absolute URL of a path on the production site, no trailing slash. */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Next metadata for one registry entry (Machine-readable layer #14,
 * decision 10). The registry title is the full rendered `<title>`.
 */
export function pageMetadata(page: Page): Metadata {
  const title = { absolute: page.title };
  const socialTitle = page.title.endsWith(SUFFIX)
    ? page.title.slice(0, -SUFFIX.length)
    : page.title;
  const social = {
    openGraph: {
      title: socialTitle,
      images: shareCardOpenGraph(),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: socialTitle,
      images: shareCardTwitter(),
    },
  };
  if (!page.indexable) {
    return { title, robots: { index: false }, ...social };
  }
  const url = absoluteUrl(page.path);
  const description = page.description ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: "Oxide",
      type: page.path.startsWith("/guides/") ? "article" : "website",
      images: shareCardOpenGraph(),
    },
    // Next replaces, rather than merges, `openGraph`/`twitter` from the root
    // layout, so the one card is attached here for every page.
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: shareCardTwitter(),
    },
  };
}
