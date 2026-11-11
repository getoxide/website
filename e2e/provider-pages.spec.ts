import { expect, test } from "@playwright/test";
import { PROVIDER_PAGES } from "../src/content/provider-pages";
import { PAGES } from "../src/content/pages";
import { REGISTERED } from "./pages";
import { SNAPSHOT } from "./snapshot";

// /claude-code-gui and /codex-gui (Copy deck; Page inventory #9): locked FAQs
// anchored and visible, the required internal links, all with JS off.
const LANDING = [
  { page: PAGES.claudeCodeGui, copy: PROVIDER_PAGES.claudeCode },
  { page: PAGES.codexGui, copy: PROVIDER_PAGES.codex },
];

const REQUIRED_LINKS = [
  "/features#verification-dossier",
  "/features#blind-review",
  "/guides/review-ai-generated-code",
  "/guides/claude-code-and-codex-together",
];

const registered = new Set(REGISTERED.map((p) => p.path));

for (const { page: entry, copy } of LANDING) {
  test.describe(entry.path, () => {
    test.use({ javaScriptEnabled: false });

    test("shows the intro, the definition and every section with JavaScript off", async ({
      page,
    }) => {
      await page.goto(entry.path);
      const main = page.locator("main");
      await expect(main).toContainText(copy.intro.replaceAll("`", ""));
      // The footer carries the definition too; this is the page's own copy.
      await expect(main.getByTestId("definition")).toBeVisible();
      for (const { heading } of copy.sections) {
        await expect(
          main.getByRole("heading", { name: heading, level: 2 }),
        ).toBeVisible();
      }
    });

    test("renders ⟨platforms⟩ from the Snapshot in the Windows answer", async ({
      page,
    }) => {
      await page.goto(entry.path);
      const platforms = SNAPSHOT.release.platforms;
      const answer = page.getByRole("region", {
        name: /Does Oxide work with .* on Windows\?/,
      });
      await expect(answer).toContainText(platforms[0]);
      await expect(answer).toContainText(platforms.at(-1)!);
      await expect(answer).not.toContainText("⟨");
    });

    test("anchors each FAQ question and shows the answer, never collapsed", async ({
      page,
    }) => {
      await page.goto(entry.path);
      await expect(page.locator("main details")).toHaveCount(0);
      await expect(page.locator("main h3")).toHaveText(
        copy.faq.map((q) => q.question),
      );
      for (const { id, question } of copy.faq) {
        await expect(page.locator(`h3#${id}`)).toHaveText(question);
        await expect(
          page.getByRole("link", { name: `Link to ${question}` }),
        ).toHaveAttribute("href", `#${id}`);
        await expect(
          page.getByRole("region", { name: question }).locator("p"),
        ).toBeVisible();
      }
      const last = copy.faq.at(-1)!.id;
      await page.goto(`${entry.path}#${last}`);
      await expect(page.locator(`h3#${last}`)).toBeInViewport();
    });

    test("links the required pages, and every internal link resolves", async ({
      page,
    }) => {
      await page.goto(entry.path);
      const hrefs = await page
        .locator("main a[href^='/']")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
      for (const required of REQUIRED_LINKS) expect(hrefs).toContain(required);
      for (const href of new Set(hrefs)) {
        const { pathname, hash } = new URL(href, "http://localhost");
        // Only registered routes are followed: a route that ships in a
        // sibling ticket is asserted by its href above until it registers.
        if (!registered.has(pathname)) continue;
        const res = await page.request.get(pathname);
        expect(res.status(), href).toBe(200);
        if (!hash) continue;
        // Follow the fragment with JavaScript off: the target is in the HTML.
        await page.goto(href);
        await expect(page.locator(`[id="${hash.slice(1)}"]`)).toHaveCount(1);
      }
    });
  });
}
