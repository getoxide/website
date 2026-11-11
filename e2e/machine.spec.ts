import { expect, test } from "@playwright/test";
import { PAGES, SITE_URL } from "../src/content/pages";
import { SNAPSHOT } from "./snapshot";
import { urlOf } from "./pages";

const PAGES_ALL = Object.values(PAGES);
const INDEXABLE = PAGES_ALL.filter((page) => page.indexable);
const absolute = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;

test.describe("machine-readable root files", () => {
  test("robots.txt allows every crawler and names one absolute sitemap", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe(
      [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
      ].join("\n"),
    );
  });

  test("sitemap.xml lists every indexable page, absolute, without priority or changefreq", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const page of INDEXABLE) {
      expect(xml).toContain(`<loc>${absolute(page.path)}</loc>`);
    }
    expect(xml).not.toContain("/404");
    expect(xml).not.toMatch(/priority|changefreq/);
    // The Snapshot has no stable release: even /changelog and /download carry
    // no lastmod until one exists.
    if (SNAPSHOT.release.state !== "stable") {
      expect(xml).not.toContain("<lastmod>");
    }
  });

  test("llms.txt opens with the definition and lists every site page", async ({
    request,
  }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.startsWith("# Oxide\n\n")).toBe(true);
    expect(text).toContain(`> ${SNAPSHOT.readme.definition}`);
    for (const section of ["Docs", "Guides", "Pages", "Optional"]) {
      expect(text).toContain(`## ${section}`);
    }
    for (const page of INDEXABLE) {
      expect(text, page.path).toContain(`](${absolute(page.path)})`);
    }
    expect(text).toContain(
      "[GitHub repository](https://github.com/getoxide/oxide)",
    );
    expect(text).toContain(
      "[Releases](https://github.com/getoxide/oxide/releases)",
    );
    expect(text).toContain(
      "[llms.txt for contributors](https://github.com/getoxide/oxide/blob/main/llms.txt)",
    );
  });

  test("the share card is served as a PNG", async ({ request }) => {
    const res = await request.get("/og.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(body.length).toBeGreaterThan(100_000);
  });
});

test.describe("structured data", () => {
  for (const page of PAGES_ALL) {
    test(`${page.path}: valid JSON-LD of the registry's type`, async ({
      page: tab,
    }) => {
      await tab.goto(urlOf(page));
      const scripts = await tab
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      if (page.path === "/404") {
        expect(scripts).toHaveLength(0);
        return;
      }
      expect(scripts).toHaveLength(1);
      const data = JSON.parse(scripts[0]);
      expect(data["@context"]).toBe("https://schema.org");
      expect(JSON.stringify(data)).not.toMatch(
        /"(?:aggregateRating|review|ratingValue)"\s*:/,
      );
      if (page.path === "/") {
        expect(
          data["@graph"].map((n: { "@type": string }) => n["@type"]),
        ).toEqual(["WebSite", "Organization", "SoftwareApplication"]);
      } else if (page.path === "/faq") {
        expect(data["@type"]).toBe("FAQPage");
        await expect(tab.locator("main h2:not(#closing-cta)")).toHaveText(
          data.mainEntity.map((q: { name: string }) => q.name),
        );
      } else {
        expect(data["@type"]).toBe(
          page.structuredData === "TechArticle" ? "TechArticle" : "WebPage",
        );
        expect(data.isPartOf).toEqual({ "@id": `${SITE_URL}/#website` });
        expect(data.about).toEqual({ "@id": `${SITE_URL}/#software` });
      }
    });
  }
});

test("every page carries the Search Console verification meta tag", async ({
  page,
}) => {
  for (const entry of PAGES_ALL) {
    await page.goto(urlOf(entry));
    const content = await page
      .locator('meta[name="google-site-verification"]')
      .getAttribute("content");
    expect(content, entry.path).toBeTruthy();
  }
});
