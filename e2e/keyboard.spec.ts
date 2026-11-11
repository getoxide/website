import { expect, test, type Page } from "@playwright/test";
import { SNAPSHOT } from "./snapshot";
import { REGISTERED, urlOf } from "./pages";

// Budgets, Accessibility (Focus, Keyboard, Targets); Design system, Focus and
// states.

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

type Focused = {
  name: string;
  x: number;
  y: number;
  outline: string;
  inHeader: boolean;
};

/** Presses Tab and describes the element that receives focus. */
async function tab(page: Page): Promise<Focused> {
  await page.keyboard.press("Tab");
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      name: (
        el.textContent ||
        el.querySelector("img")?.getAttribute("alt") ||
        ""
      ).trim(),
      x: box.x,
      y: box.y,
      outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineOffset}`,
      inHeader: !!el.closest("header"),
    };
  });
}

/**
 * Every visible control in the header and footer, with its size. Links
 * inside the footer's canonical definition are exempt: they sit in a
 * sentence, WCAG 2.5.8's "inline" exception.
 */
function controlSizes(page: Page) {
  return page
    .locator("header, footer")
    .locator("a, summary, button")
    .evaluateAll((els) =>
      els
        .filter((el) => el.getClientRects().length > 0)
        .filter((el) => !el.closest('[data-testid="definition"]'))
        .map((el) => {
          const box = el.getBoundingClientRect();
          return {
            name: el.textContent!.trim() || el.outerHTML.slice(0, 60),
            width: box.width,
            height: box.height,
          };
        }),
    );
}

const FOCUS_RING = "solid 2px 2px";

test.describe("at 1280px", () => {
  test.use({ viewport: DESKTOP });

  for (const entry of REGISTERED) {
    test(`${entry.path}: every header and footer target is at least 24×24`, async ({
      page,
    }) => {
      await page.goto(urlOf(entry));
      const sizes = await controlSizes(page);
      expect(sizes.length).toBeGreaterThan(20);
      for (const size of sizes) {
        expect(size.width, size.name).toBeGreaterThanOrEqual(24);
        expect(size.height, size.name).toBeGreaterThanOrEqual(24);
      }
    });
  }

  test("tabbing walks the header left to right, every stop visibly focused", async ({
    page,
  }) => {
    await page.goto("/privacy");
    const stops: Focused[] = [];
    await tab(page); // skip link
    for (;;) {
      const stop = await tab(page);
      if (!stop.inHeader) break;
      stops.push(stop);
    }
    expect(stops.map((s) => s.name)).toEqual([
      "Oxide", // the logo, named by its alt text
      "Features",
      "Docs",
      "Guides",
      "Changelog",
      "GitHub",
      "Download",
    ]);
    for (const [i, stop] of stops.entries()) {
      expect(stop.outline, stop.name).toBe(FOCUS_RING);
      if (i > 0) expect(stop.x).toBeGreaterThan(stops[i - 1].x);
    }
  });

  test("tabbing walks the footer in reading order, every stop visibly focused", async ({
    page,
  }) => {
    await page.goto("/privacy");
    const footerLinks = page.getByRole("contentinfo").getByRole("link");
    await footerLinks.first().focus();
    const names = [(await footerLinks.first().textContent())!];
    const outlines = [
      await footerLinks
        .first()
        .evaluate((el) => getComputedStyle(el).outlineStyle),
    ];
    for (let i = 1; i < (await footerLinks.count()); i++) {
      const stop = await tab(page);
      names.push(stop.name);
      outlines.push(stop.outline.split(" ")[0]);
    }
    expect(names).toEqual([
      // Links in the canonical definition, which opens the footer.
      ...[
        ...SNAPSHOT.readme.definition.matchAll(/(?<!!)\[([^\]]+)\]\(/g),
      ].map((m) => m[1]),
      "Features",
      "Download",
      "Changelog",
      "FAQ",
      "Claude Code",
      "Codex",
      "Docs",
      "Guides",
      "GitHub",
      "llms.txt",
      "getoxide/oxide",
      "Privacy",
      "Licence",
      "Made by Lorenzo Cavallini",
    ]);
    expect(new Set(outlines)).toEqual(new Set(["solid"]));
  });
});

test.describe("at 390px", () => {
  test.use({ viewport: MOBILE });

  for (const entry of REGISTERED) {
    test(`${entry.path}: every target is at least 24×24, menu open`, async ({
      page,
    }) => {
      await page.goto(urlOf(entry));
      await page.getByRole("banner").getByText("Menu", { exact: true }).click();
      const sizes = await controlSizes(page);
      expect(sizes.map((s) => s.name)).toContain("Changelog");
      for (const size of sizes) {
        expect(size.width, size.name).toBeGreaterThanOrEqual(24);
        expect(size.height, size.name).toBeGreaterThanOrEqual(24);
      }
    });
  }

  test("tabbing reaches Download before the menu, then the open menu's links top to bottom", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await tab(page); // skip link
    const row = [await tab(page), await tab(page), await tab(page)];
    expect(row.map((s) => s.name)).toEqual(["Oxide", "GitHub", "Download"]);
    const menu = await tab(page);
    expect(menu.name).toBe("Menu");
    for (const [i, stop] of [...row, menu].entries()) {
      expect(stop.outline, stop.name).toBe(FOCUS_RING);
      if (i > 0) expect(stop.x).toBeGreaterThan(row[i - 1].x);
    }

    await page.keyboard.press("Enter");
    const panel = [
      await tab(page),
      await tab(page),
      await tab(page),
      await tab(page),
    ];
    expect(panel.map((s) => s.name)).toEqual([
      "Features",
      "Docs",
      "Guides",
      "Changelog",
    ]);
    for (const [i, stop] of panel.entries()) {
      expect(stop.outline, stop.name).toBe(FOCUS_RING);
      expect(stop.y).toBeGreaterThan(i > 0 ? panel[i - 1].y : menu.y);
    }
  });
});
