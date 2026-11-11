import { expect, test, type Locator, type Page } from "@playwright/test";
import { REGISTERED, urlOf } from "./pages";

// Design system, Header; Page inventory (#9), Header.
const NAV_LINKS: [string, string][] = [
  ["Features", "/features"],
  ["Docs", "/docs/quick-start"],
  ["Guides", "/guides"],
  ["Changelog", "/changelog"],
];
const GITHUB = "https://github.com/getoxide/oxide";

const DESKTOP = { width: 1280, height: 800 };

const header = (page: Page) => page.getByRole("banner");

/** Only the links a visitor can see (and reach) at the current width. */
const visibleLink = (scope: Locator, name: string) =>
  scope.getByRole("link", { name, exact: true }).locator("visible=true");

const MOBILE = { width: 390, height: 844 };

for (const javaScriptEnabled of [true, false]) {
  test.describe(`header at 390px, JavaScript ${javaScriptEnabled ? "on" : "off"}`, () => {
    test.use({ viewport: MOBILE, javaScriptEnabled });

    test("the menu opens and closes, and Download stays visible", async ({
      page,
    }) => {
      await page.goto("/privacy");
      const banner = header(page);
      const download = visibleLink(banner, "Download");
      const menu = banner.getByText("Menu", { exact: true });

      await expect(download).toBeInViewport();
      await expect(visibleLink(banner, "GitHub")).toBeInViewport();
      for (const [name] of NAV_LINKS) {
        await expect(visibleLink(banner, name)).toHaveCount(0);
      }

      await menu.click();
      for (const [name, href] of NAV_LINKS) {
        const link = visibleLink(banner, name);
        await expect(link).toBeInViewport();
        await expect(link).toHaveAttribute("href", href);
      }
      await expect(download).toBeInViewport();

      await menu.click();
      for (const [name] of NAV_LINKS) {
        await expect(visibleLink(banner, name)).toHaveCount(0);
      }
      await expect(download).toBeInViewport();
    });

    test("the menu opens from the keyboard", async ({ page }) => {
      await page.goto("/privacy");
      const banner = header(page);
      await banner.getByText("Menu", { exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(visibleLink(banner, "Features")).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(visibleLink(banner, "Features")).toHaveCount(0);
    });
  });
}

test.describe("header placement", () => {
  test.use({ viewport: DESKTOP });

  test("on the home it sits over the hero, transparent and not sticky", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = header(page);
    await expect(banner).toHaveCSS("position", "absolute");
    await expect(banner).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(banner).toHaveCSS("border-bottom-style", "none");
  });

  test("elsewhere it is in flow, with a bottom border, and not sticky", async ({
    page,
  }) => {
    await page.goto("/privacy");
    const banner = header(page);
    expect(["static", "relative"]).toContain(
      await banner.evaluate((el) => getComputedStyle(el).position),
    );
    await expect(banner).toHaveCSS("border-bottom-style", "solid");
    await expect(banner).toHaveCSS("border-bottom-width", "1px");
    // --ox-background and --ox-border from the synced brand tokens.
    await expect(banner).toHaveCSS("background-color", "rgb(28, 28, 30)");
    await expect(banner).toHaveCSS("border-bottom-color", "rgb(51, 51, 53)");
    const main = page.getByRole("main");
    const headerBox = (await banner.boundingBox())!;
    const mainBox = (await main.boundingBox())!;
    expect(mainBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  });
});

test.describe("current page", () => {
  test.use({ viewport: DESKTOP });

  test("the logo is the current link on the home, and only there", async ({
    page,
  }) => {
    await page.goto("/");
    const current = header(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("href", "/");

    await page.goto("/privacy");
    await expect(header(page).locator("[aria-current]")).toHaveCount(0);
  });
});

test.describe("header at 1280px", () => {
  test.use({ viewport: DESKTOP });

  for (const entry of REGISTERED) {
    test(`${entry.path}: logo, the four links, GitHub and Download`, async ({
      page,
    }) => {
      await page.goto(urlOf(entry));
      const banner = header(page);

      const logo = visibleLink(banner, "Oxide");
      await expect(logo).toHaveAttribute("href", "/");
      await expect(logo.locator("img")).toHaveAttribute("height", "26");

      for (const [name, href] of NAV_LINKS) {
        await expect(visibleLink(banner, name)).toHaveAttribute("href", href);
      }
      const github = visibleLink(banner, "GitHub");
      await expect(github).toHaveAttribute("href", GITHUB);
      await expect(github.locator("svg")).toHaveCount(1);
      await expect(github).not.toContainText(/\d/); // no star count

      await expect(visibleLink(banner, "Download")).toHaveAttribute(
        "href",
        "/download",
      );
    });
  }
});
