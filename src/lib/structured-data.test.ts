import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL } from "@/content/pages";
import { faqOf } from "@/lib/faq";
import { LICENCE_URL } from "@/lib/oxide";
import { SNAPSHOT } from "@/lib/snapshot";
import {
  faqPageNode,
  homeGraph,
  markdownText,
  serializeJsonLd,
  structuredDataFor,
} from "./structured-data";

const page = (path: string) =>
  Object.values(PAGES).find((p) => p.path === path)!;
const ids = () => ({
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#organization`,
  software: `${SITE_URL}/#software`,
});

const HOME = Object.values(PAGES).find((p) => p.path === "/")!;

describe("the home @graph", () => {
  const graph = homeGraph(SNAPSHOT);
  const byType = (type: string) =>
    (graph["@graph"] as Record<string, unknown>[]).find(
      (node) => node["@type"] === type,
    )!;

  it("is one graph with stable ids for the site, the org and the app", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(
      (graph["@graph"] as { "@id": string }[]).map((node) => node["@id"]),
    ).toEqual([ids().website, ids().organization, ids().software]);
  });

  it("names the WebSite 'Oxide' with its alternate names", () => {
    expect(byType("WebSite")).toMatchObject({
      "@id": ids().website,
      url: SITE_URL,
      name: "Oxide",
      alternateName: ["getoxide", "Oxide app"],
      inLanguage: "en",
    });
  });

  it("names the Organization and keeps it apart from Oxide Computer Company", () => {
    expect(byType("Organization")).toMatchObject({
      "@id": ids().organization,
      name: "Oxide",
      alternateName: "getoxide",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ["https://github.com/getoxide"],
      founder: {
        "@type": "Person",
        name: "Lorenzo Cavallini",
        url: "https://cavallinilorenzo.com",
      },
    });
  });

  it("describes the SoftwareApplication with the canonical definition", () => {
    const app = byType("SoftwareApplication");
    expect(app).toMatchObject({
      "@id": ids().software,
      name: "Oxide",
      description: markdownText(SNAPSHOT.readme.definition),
      applicationCategory: "DeveloperApplication",
      operatingSystem: SNAPSHOT.release.platforms.join(", "),
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: LICENCE_URL,
      downloadUrl: `${SITE_URL}/download`,
      sameAs: ["https://github.com/getoxide/oxide"],
    });
    expect(markdownText(SNAPSHOT.readme.definition)).not.toMatch(/[*[\]]/);
    // No stable release in the Snapshot: the version is omitted, not empty.
    expect(app).not.toHaveProperty("softwareVersion");
  });

  it("derives the platforms and the price from the Snapshot", () => {
    const app = byType("SoftwareApplication");
    expect(app.operatingSystem).toBe("macOS on Apple Silicon, Windows x64");

    const windowsOnly = {
      ...SNAPSHOT,
      release: { ...SNAPSHOT.release, platforms: ["Windows x64"] },
    };
    const node = (
      homeGraph(windowsOnly)["@graph"] as Record<string, unknown>[]
    ).find((n) => n["@type"] === "SoftwareApplication")!;
    expect(node.operatingSystem).toBe("Windows x64");

    const priced = {
      ...SNAPSHOT,
      readme: {
        ...SNAPSHOT.readme,
        definition: SNAPSHOT.readme.definition.replace("free, ", ""),
      },
    };
    const noOffer = (
      homeGraph(priced)["@graph"] as Record<string, unknown>[]
    ).find((n) => n["@type"] === "SoftwareApplication")!;
    expect(noOffer).not.toHaveProperty("offers");
  });

  it("adds the version once a stable release exists", () => {
    const stable = {
      ...SNAPSHOT,
      release: {
        ...SNAPSHOT.release,
        state: "stable" as const,
        latest: {
          version: "1.2.3",
          tag: "v1.2.3",
          date: "2026-12-10",
          url: "https://github.com/getoxide/oxide/releases/tag/v1.2.3",
          prerelease: false,
          assets: SNAPSHOT.release.latest?.assets ?? {
            macos: { name: null, url: "", size: null },
            windows: { name: null, url: "", size: null },
          },
        },
      },
    };
    const app = (homeGraph(stable)["@graph"] as Record<string, unknown>[]).find(
      (node) => node["@type"] === "SoftwareApplication",
    )!;
    expect(app.softwareVersion).toBe("1.2.3");
  });

  it("never invents a rating or a review", () => {
    for (const entry of Object.values(PAGES)) {
      const json = JSON.stringify(structuredDataFor(entry, SNAPSHOT));
      expect(json, entry.path).not.toMatch(
        /"(?:aggregateRating|review|ratingValue)"\s*:/,
      );
    }
  });
});

describe("per-page structured data", () => {
  it("gives guides a TechArticle and other pages a WebPage, both linked to the site and app", () => {
    for (const path of ["/features", "/download", "/privacy"]) {
      expect(structuredDataFor(page(path), SNAPSHOT)).toMatchObject({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${SITE_URL}${path}#webpage`,
        url: `${SITE_URL}${path}`,
        name: page(path).title.replace(/ · Oxide$/, ""),
        description: page(path).description,
        isPartOf: { "@id": ids().website },
        about: { "@id": ids().software },
      });
    }
    for (const path of [
      "/guides/review-ai-generated-code",
      "/docs/quick-start",
    ]) {
      expect(structuredDataFor(page(path), SNAPSHOT)).toMatchObject({
        "@type": "TechArticle",
        "@id": `${SITE_URL}${path}#webpage`,
        headline: page(path).h1,
        isPartOf: { "@id": ids().website },
        about: { "@id": ids().software },
      });
    }
  });

  it("puts the FAQPage, and only the FAQPage, on /faq", () => {
    const faq = faqPageNode(page("/faq"), faqOf(SNAPSHOT));
    expect(faq).toMatchObject({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/faq#webpage`,
      url: `${SITE_URL}/faq`,
      isPartOf: { "@id": ids().website },
      about: { "@id": ids().software },
    });
    const questions = faq.mainEntity as {
      name: string;
      acceptedAnswer: { text: string };
    }[];
    expect(questions.map((q) => q.name)).toEqual(
      faqOf(SNAPSHOT).map((entry) => entry.question),
    );
    expect(questions[0].acceptedAnswer.text).not.toMatch(/[*[\]]/);
    for (const other of Object.values(PAGES).filter((p) => p.path !== "/faq")) {
      expect(JSON.stringify(structuredDataFor(other, SNAPSHOT))).not.toContain(
        "FAQPage",
      );
    }
  });

  it("has no node for the 404", () => {
    expect(structuredDataFor(PAGES.notFound, SNAPSHOT)).toBeNull();
  });

  it("uses the home graph for the home, not a WebPage node", () => {
    expect(structuredDataFor(HOME, SNAPSHOT)).toHaveProperty("@graph");
  });
});

describe("markdownText", () => {
  it("drops link targets, bold marks and inline code, keeping the words", () => {
    expect(
      markdownText(
        "Oxide is a **desktop app**, built with [Tauri](https://tauri.app) and `git`.",
      ),
    ).toBe("Oxide is a desktop app, built with Tauri and git.");
  });
});

describe("serializeJsonLd", () => {
  it("escapes '<' and stays valid JSON", () => {
    const data = { name: "</script><b>Oxide</b>" };
    const json = serializeJsonLd(data);
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual(data);
  });
});
