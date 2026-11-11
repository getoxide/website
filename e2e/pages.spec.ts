import { expect, test } from "@playwright/test";
import { PAGES } from "../src/content/pages";
import { REGISTERED, UNKNOWN_PATH, urlOf } from "./pages";

const PROD = "https://oxide.cavallinilorenzo.com";

test.describe("every registered page", () => {
  for (const page of REGISTERED) {
    test(`${page.path}: H1, title, description and social tags`, async ({
      page: tab,
    }) => {
      const res = await tab.goto(urlOf(page));
      expect(res?.status()).toBe(page.path === "/404" ? 404 : 200);

      await expect(tab).toHaveTitle(page.title);
      await expect(tab.locator("h1")).toHaveCount(1);
      await expect(tab.locator("h1")).toHaveText(page.h1);
      await expect(tab.locator("html")).toHaveAttribute("lang", "en");

      const meta = (sel: string) => tab.locator(`head ${sel}`);
      if (page.indexable) {
        const url = page.path === "/" ? PROD : `${PROD}${page.path}`;
        await expect(meta('meta[name="description"]')).toHaveAttribute(
          "content",
          page.description!,
        );
        await expect(meta('link[rel="canonical"]')).toHaveAttribute(
          "href",
          url,
        );
        await expect(meta('meta[property="og:url"]')).toHaveAttribute(
          "content",
          url,
        );
        await expect(meta('meta[property="og:title"]')).toHaveAttribute(
          "content",
          page.title.replace(/ · Oxide$/, ""),
        );
        await expect(meta('meta[property="og:description"]')).toHaveAttribute(
          "content",
          page.description!,
        );
        await expect(meta('meta[property="og:site_name"]')).toHaveAttribute(
          "content",
          "Oxide",
        );
        await expect(meta('meta[property="og:type"]')).toHaveAttribute(
          "content",
          page.path.startsWith("/guides/") ? "article" : "website",
        );
        await expect(meta('meta[name="twitter:card"]')).toHaveAttribute(
          "content",
          "summary_large_image",
        );
        await expect(meta('meta[name="robots"]')).toHaveCount(0);
      } else {
        await expect(meta('meta[name="description"]')).toHaveCount(0);
        await expect(meta('link[rel="canonical"]')).toHaveCount(0);
        await expect(meta('meta[name="robots"]')).toHaveAttribute(
          "content",
          /noindex/,
        );
      }
    });

    test(`${page.path}: skip link, landmarks and dark scheme`, async ({
      page: tab,
    }) => {
      await tab.goto(urlOf(page));
      for (const role of [
        "banner",
        "navigation",
        "main",
        "contentinfo",
      ] as const) {
        await expect(tab.getByRole(role)).toHaveCount(1);
      }
      await expect(tab.locator("html")).toHaveCSS("color-scheme", "dark");

      await tab.keyboard.press("Tab");
      const skip = tab.getByRole("link", { name: "Skip to content" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await expect(skip).toHaveCSS("outline-style", "solid");
      await expect(skip).toHaveCSS("outline-width", "2px");
      await expect(skip).toHaveCSS("outline-offset", "2px");
      await expect(skip).toHaveAttribute("href", "#main");
      await expect(tab.locator("main#main")).toHaveCount(1);
    });
  }
});

test.describe("home", () => {
  test("shows only the frozen hero H1 and its subheadline", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(
      "The complete desktop app for agentic coding.",
    );
    await expect(page.locator("main")).toHaveText(
      "The complete desktop app for agentic coding." +
        "Prompt, review, pull request and merge, with Claude Code, Codex and Antigravity CLI.",
    );
  });

  test("stays dark when the visitor prefers a light scheme", async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const light = await context.newPage();
    await light.goto("/");
    const dark = await browser.newPage();
    await dark.goto("/");
    const bg = (p: typeof light) =>
      p.evaluate(() => getComputedStyle(document.documentElement).background);
    expect(await bg(light)).toBe(await bg(dark));
    await context.close();
  });
});

test.describe("404", () => {
  test("shows the locked copy and its three links", async ({ page }) => {
    const res = await page.goto(UNKNOWN_PATH);
    expect(res?.status()).toBe(404);
    await expect(page.locator("main")).toContainText(
      "This page doesn't exist. Oxide's published URLs never move without a redirect, so if a link brought you here, it's a bug worth reporting.",
    );
    const main = page.locator("main");
    await expect(main.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(main.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs/quick-start",
    );
    await expect(
      main.getByRole("link", { name: "Report a broken link" }),
    ).toHaveAttribute("href", "https://github.com/getoxide/oxide/issues/new");
  });
});

test.describe("privacy", () => {
  test("says the app has no telemetry and links the README answer", async ({
    page,
  }) => {
    await page.goto(PAGES.privacy.path);
    const main = page.locator("main");
    await expect(main).toContainText("The Oxide app has no telemetry.");
    await expect(
      main.locator(
        'a[href="https://github.com/getoxide/oxide/blob/main/README.md#faq"]',
      ),
    ).toHaveCount(1);
  });

  test("says the site counts page views without cookies, in aggregate", async ({
    page,
  }) => {
    await page.goto(PAGES.privacy.path);
    const text = await page.locator("main").innerText();
    expect(text).toContain("GoatCounter");
    expect(text).toMatch(/page views/);
    expect(text).toMatch(/without cookies/);
    expect(text).toMatch(/aggregate/);
    expect(text).not.toMatch(/collects? nothing|nothing is collected/i);
  });
});

test.describe("brand icons", () => {
  test("the SVG icon, the .ico and the Apple touch icon are served", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const expectations: [string, string][] = [
      ['link[rel="icon"][type="image/svg+xml"]', "image/svg+xml"],
      ['link[rel="icon"][href*="favicon.ico"]', "image/x-icon"],
      ['link[rel="apple-touch-icon"]', "image/png"],
    ];
    for (const [selector, type] of expectations) {
      const href = await page.locator(selector).first().getAttribute("href");
      expect(href, selector).toBeTruthy();
      const res = await request.get(href!);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain(type);
    }
  });
});

test.describe("fonts", () => {
  test("only Space Grotesk and Inter are preloaded", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute("href")!));
    // Sizes of the committed WOFF2 files: Space Grotesk 22,288 B, Inter
    // 48,256 B (JetBrains Mono, 40,404 B, must not be preloaded).
    const sizes = await Promise.all(
      hrefs.map(async (h) => (await (await request.get(h)).body()).length),
    );
    expect(sizes.sort((a, b) => a - b)).toEqual([22288, 48256]);
  });
});
