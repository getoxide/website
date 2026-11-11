import { expect, test } from "@playwright/test";
import { GUIDES, guideSources } from "../src/content/guides";
import { PAGES } from "../src/content/pages";

// Ticket #42: `/guides` and its two guides (Copy deck, the guides' outlines).
// The ticket's verification is e2e with JavaScript off on the three pages,
// following every internal link in the content; the CI gates cover axe, the
// budgets and the Concept links.

const CTA_HEADING = "Take your next Turn all the way to the merge.";

test.describe("/guides", () => {
  test("lists the two guides, in order, with their locked H1s", async ({
    page,
  }) => {
    await page.goto(PAGES.guides.path);
    await expect(page.locator("h1")).toHaveText(PAGES.guides.h1);
    const links = page.locator('main a[href^="/guides/"]');
    await expect(links).toHaveText(GUIDES.map((guide) => guide.page.h1));
    for (const guide of GUIDES) {
      await expect(page.locator("main")).toContainText(guide.summary);
    }
    // No dates and no feed on the index.
    await expect(page.locator("main time")).toHaveCount(0);
  });
});

for (const guide of GUIDES) {
  test.describe(guide.page.path, () => {
    test("shows the outline in order with JavaScript off", async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(guide.page.path);
      await expect(page.locator("h1")).toHaveText(guide.page.h1);
      const headings = page.locator("main h2:not(#closing-cta)");
      await expect(headings).toHaveText(
        guide.sections.map((section) => section.heading),
      );
      for (const section of guide.sections) {
        await expect(page.locator(`h2#${section.id}`)).toBeVisible();
      }
      await context.close();
    });

    test("ends with the cross-link to the other guide, then the CTA", async ({
      page,
    }) => {
      const other = GUIDES.find((g) => g.page.path !== guide.page.path)!;
      await page.goto(guide.page.path);
      const order = await page.evaluate((otherPath) => {
        const link = [
          ...document.querySelectorAll(`main a[href="${otherPath}"]`),
        ].at(-1);
        const outline = [...document.querySelectorAll("main h2")]
          .filter((heading) => heading.id !== "closing-cta")
          .at(-1)!;
        const cta = document.querySelector(
          'main section[aria-labelledby="closing-cta"]',
        )!;
        const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
        return {
          found: link !== undefined,
          afterOutline:
            link !== undefined &&
            !!(outline.compareDocumentPosition(link) & FOLLOWING),
          beforeCta:
            link !== undefined &&
            !!(link.compareDocumentPosition(cta) & FOLLOWING),
        };
      }, other.page.path);
      expect(order).toEqual({
        found: true,
        afterOutline: true,
        beforeCta: true,
      });
      await expect(
        page.getByRole("region", { name: CTA_HEADING }),
      ).toBeVisible();
    });

    test("links its outline to the /features anchors it names", async ({
      page,
    }) => {
      await page.goto(guide.page.path);
      const anchors = new Set(
        guideSources(guide).flatMap((source) =>
          [...source.matchAll(/\/features#([\w-]+)/g)].map((m) => m[1]),
        ),
      );
      expect(anchors.size).toBeGreaterThan(0);
      for (const anchor of anchors) {
        await expect(
          page.locator(`main a[href="/features#${anchor}"]`),
        ).not.toHaveCount(0);
      }
    });

    test("follows every internal link in the content with JavaScript off", async ({
      browser,
      request,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(guide.page.path);
      const hrefs = await page
        .locator('main a[href^="/"]')
        .evaluateAll((links) => [
          ...new Set(links.map((link) => link.getAttribute("href")!)),
        ]);
      expect(hrefs.length).toBeGreaterThan(3);
      for (const href of hrefs) {
        const url = new URL(href, "http://site.test");
        const response = await request.get(url.pathname);
        expect(
          response.status(),
          `${href} linked from ${guide.page.path}`,
        ).toBe(200);
        if (url.hash) {
          await page.goto(`${url.pathname}${url.hash}`);
          await expect(page.locator(url.hash), href).toHaveCount(1);
        }
      }
      await context.close();
    });
  });
}
