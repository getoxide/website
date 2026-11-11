import { expect, test } from "@playwright/test";
import { REGISTERED, urlOf } from "./pages";
import { oxideFileUrl } from "./snapshot";

// Page inventory (#9), Footer; Design system, Footer.
const COLUMNS: [string, [string, string][]][] = [
  [
    "Product",
    [
      ["Features", "/features"],
      ["Download", "/download"],
      ["Changelog", "/changelog"],
      ["FAQ", "/faq"],
    ],
  ],
  [
    "Use with",
    [
      ["Claude Code", "/claude-code-gui"],
      ["Codex", "/codex-gui"],
    ],
  ],
  [
    "Resources",
    [
      ["Docs", "/docs/quick-start"],
      ["Guides", "/guides"],
      ["GitHub", "https://github.com/getoxide/oxide"],
      ["llms.txt", "/llms.txt"],
    ],
  ],
];

const LINES = [
  "Free and open source (MIT) · Local · No account · No telemetry",
  "Not affiliated with Oxide Computer Company",
  "Claude Code, Codex and Antigravity are trademarks of their respective owners; Oxide is not affiliated with or endorsed by Anthropic, OpenAI or Google",
];

for (const entry of REGISTERED) {
  test(`${entry.path}: footer columns, trust line and disclaimers`, async ({
    page,
  }) => {
    await page.goto(urlOf(entry));
    const footer = page.getByRole("contentinfo");

    for (const [heading, links] of COLUMNS) {
      await expect(
        footer.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      const list = footer.getByRole("list", { name: heading, exact: true });
      await expect(list.getByRole("link")).toHaveCount(links.length);
      for (const [i, [name, href]] of links.entries()) {
        const link = list.getByRole("link").nth(i);
        await expect(link).toHaveText(name);
        await expect(link).toHaveAttribute("href", href);
      }
    }

    for (const line of LINES) {
      await expect(footer.getByText(line, { exact: true })).toBeVisible();
    }
    await expect(
      footer.getByText("getoxide/oxide", { exact: true }),
    ).toBeVisible();

    const links: [string, string][] = [
      ["Made by Lorenzo Cavallini", "https://cavallinilorenzo.com"],
      ["Privacy", "/privacy"],
      ["Licence", oxideFileUrl("LICENSE")],
    ];
    for (const [name, href] of links) {
      await expect(
        footer.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", href);
    }
  });
}

test("the footer marks the link to the page being viewed", async ({ page }) => {
  await page.goto("/privacy");
  const privacy = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy", exact: true });
  await expect(privacy).toHaveAttribute("aria-current", "page");

  await page.goto("/");
  await expect(
    page.getByRole("contentinfo").locator('[aria-current="page"]'),
  ).toHaveCount(0);
});
