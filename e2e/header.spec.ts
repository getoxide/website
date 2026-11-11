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
