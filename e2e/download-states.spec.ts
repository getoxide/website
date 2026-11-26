import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { fixtureOrigin, type Fixture } from "./ports";

const UA = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

const ASSET = {
  stable: {
    macos:
      "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_aarch64.dmg",
    windows:
      "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_x64-setup.exe",
    linux:
      "https://github.com/getoxide/oxide/releases/download/v1.1.0/Oxide_1.1.0_amd64.AppImage",
  },
  prerelease: {
    macos:
      "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_aarch64.dmg",
    windows:
      "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_x64-setup.exe",
    linux:
      "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_amd64.AppImage",
  },
};

const UNSUPPORTED = "Intel Macs aren't packaged yet.";

async function open(
  browser: Browser,
  fixture: Fixture,
  {
    ua,
    js = true,
    path = "/download",
  }: { ua: string; js?: boolean; path?: string },
): Promise<Page> {
  const context = await browser.newContext({
    userAgent: ua,
    javaScriptEnabled: js,
    baseURL: fixtureOrigin(fixture),
  });
  const page = await context.newPage();
  await page.goto(path);
  return page;
}

type Shown = { name: string; href: string; primary: boolean };

/** The three primary platform buttons in visual order, with their look. */
async function platformButtons(page: Page): Promise<Shown[]> {
  const buttons = page.locator(
    'main a[role!="none"][data-goatcounter-click^="download-"]',
  );
  // First 3 buttons are the main platform buttons inside `.buttons`
  const mainButtons = page.locator(
    'main div[class*="buttons"] a[data-goatcounter-click^="download-"]',
  );
  await expect(mainButtons).toHaveCount(3);
  const shown = await mainButtons.evaluateAll((links) => {
    const probe = document.createElement("div");
    probe.style.background = "var(--ox-accent)";
    document.body.append(probe);
    const accent = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return links.map((a) => {
      const box = a.getBoundingClientRect();
      return {
        top: box.top,
        left: box.left,
        href: a.getAttribute("href")!,
        primary: getComputedStyle(a).backgroundColor === accent,
      };
    });
  });
  const names = await Promise.all(
    (await mainButtons.all()).map(async (b) =>
      (await b.innerText()).replace(/\s+/g, " ").trim(),
    ),
  );
  void buttons;
  return shown
    .map((s, i) => ({ ...s, name: names[i] }))
    .sort((a, b) => a.top - b.top || a.left - b.left)
    .map(({ name, href, primary }) => ({ name, href, primary }));
}

test.describe("stable", () => {
  const mac = { name: "Download for macOS", href: ASSET.stable.macos };
  const win = { name: "Download for Windows", href: ASSET.stable.windows };
  const lin = { name: "Download for Linux", href: ASSET.stable.linux };

  test("macOS: macOS primary, Windows and Linux secondary", async ({
    browser,
  }) => {
    const page = await open(browser, "stable", { ua: UA.mac });
    expect(await platformButtons(page)).toEqual([
      { ...mac, primary: true },
      { ...win, primary: false },
      { ...lin, primary: false },
    ]);
    const main = page.locator("main");
    await expect(main).toContainText("Apple Silicon · .dmg · 101.2 MB");
    await expect(main).toContainText("x64 · installer · 88.8 MB");
    await expect(main).toContainText("x64 · AppImage · 94.3 MB");
    await expect(main).toContainText(
      "Version 1.1.0 · 10 December 2026 · Release notes",
    );
    await expect(
      main.getByRole("link", { name: "Release notes" }),
    ).toHaveAttribute("href", "/changelog");
  });

  test("Windows: Windows primary and first", async ({ browser }) => {
    const page = await open(browser, "stable", { ua: UA.windows });
    expect(await platformButtons(page)).toEqual([
      { ...win, primary: true },
      { ...mac, primary: false },
      { ...lin, primary: false },
    ]);
  });

  test("Linux: Linux primary and first", async ({ browser }) => {
    const page = await open(browser, "stable", { ua: UA.linux });
    expect(await platformButtons(page)).toEqual([
      { ...lin, primary: true },
      { ...mac, primary: false },
      { ...win, primary: false },
    ]);
    await expect(page.locator("main").getByText(UNSUPPORTED)).toBeVisible();
  });

  test("Windows with JavaScript off: macOS stays primary, all links present", async ({
    browser,
  }) => {
    const page = await open(browser, "stable", { ua: UA.windows, js: false });
    expect(await platformButtons(page)).toEqual([
      { ...mac, primary: true },
      { ...win, primary: false },
      { ...lin, primary: false },
    ]);
  });

  for (const [platform, ua] of Object.entries(UA)) {
    test(`${platform}: nothing shifts, redirects or downloads`, async ({
      browser,
    }) => {
      const page = await open(browser, "stable", { ua });
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.waitForLoadState("load");
      await page.waitForTimeout(500);
      const shift = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries() as unknown as {
                value: number;
                hadRecentInput: boolean;
              }[]) {
                if (!e.hadRecentInput) total += e.value;
              }
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve(total), 100);
          }),
      );
      expect(shift).toBe(0);
      expect(new URL(page.url()).pathname).toBe("/download");
      expect(downloads).toBe(0);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("prerelease-only", () => {
  test("macOS: macOS primary with test pre-release note", async ({
    browser,
  }) => {
    const page = await open(browser, "prerelease-only", { ua: UA.mac });
    expect(await platformButtons(page)).toEqual([
      {
        name: "Download for macOS",
        href: ASSET.prerelease.macos,
        primary: true,
      },
      {
        name: "Download for Windows",
        href: ASSET.prerelease.windows,
        primary: false,
      },
      {
        name: "Download for Linux",
        href: ASSET.prerelease.linux,
        primary: false,
      },
    ]);
    await expect(page.locator("main")).toContainText(
      "Test pre-release 1.2.0-rc.1: it never reaches the in-app updater or the APT and DNF repositories.",
    );
    await expect(page.locator("main")).not.toContainText("Release notes");
  });

  test("Linux: Linux primary and first", async ({ browser }) => {
    const page = await open(browser, "prerelease-only", { ua: UA.linux });
    expect(await platformButtons(page)).toEqual([
      {
        name: "Download for Linux",
        href: ASSET.prerelease.linux,
        primary: true,
      },
      {
        name: "Download for macOS",
        href: ASSET.prerelease.macos,
        primary: false,
      },
      {
        name: "Download for Windows",
        href: ASSET.prerelease.windows,
        primary: false,
      },
    ]);
  });
});

test("an unresolved installer links the GitHub release page", async ({
  browser,
}) => {
  const page = await open(browser, "unresolved", { ua: UA.windows });
  expect(await platformButtons(page)).toEqual([
    {
      name: "Download for Windows",
      href: "https://github.com/getoxide/oxide/releases/tag/v1.1.0",
      primary: true,
    },
    {
      name: "Download for macOS",
      href: ASSET.stable.macos,
      primary: false,
    },
    {
      name: "Download for Linux",
      href: ASSET.stable.linux,
      primary: false,
    },
  ]);
  await expect(page.locator("main")).not.toContainText(
    /(?<!\/dev\/)\b(null|undefined)\b/,
  );
});

test.describe("none", () => {
  test("Follow on GitHub and Build from source, no download button", async ({
    browser,
  }) => {
    const page = await open(browser, "none", { ua: UA.mac });
    const main = page.locator("main");
    await expect(
      main.locator('a[data-goatcounter-click^="download-"]'),
    ).toHaveCount(0);
    await expect(
      main.getByRole("link", { name: "Follow on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/getoxide/oxide");
    await expect(
      main.getByRole("link", { name: "Build from source" }).first(),
    ).toHaveAttribute("href", /README\.md#build-from-source$/);
    await expect(main).toContainText(
      "No release yet. Oxide is pre-release software; follow the repository to hear about the first one.",
    );
  });
});

test.describe("closing CTA primary", () => {
  for (const [fixture, label] of [
    ["none", "Get Oxide"],
    ["prerelease-only", "Download Oxide"],
    ["stable", "Download Oxide"],
  ] as const) {
    test(`${fixture}: ${label}`, async ({ browser }) => {
      const page = await open(browser, fixture, { ua: UA.mac, path: "/" });
      const cta = page.getByRole("region", {
        name: "Open a folder and start a clean shell.",
      });
      await expect(
        cta.locator('a:not([href^="/docs/concepts#"])').first(),
      ).toHaveText(label);
    });
  }
});

for (const fixture of ["stable", "prerelease-only", "unresolved"] as const) {
  for (const [platform, ua] of [
    ["mac", UA.mac],
    ["windows", UA.windows],
    ["linux", UA.linux],
  ] as const) {
    test(`axe: ${fixture} on ${platform} has no WCAG 2.2 A/AA violations`, async ({
      browser,
    }) => {
      const page = await open(browser, fixture, { ua });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
