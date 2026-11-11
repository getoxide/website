import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { fixtureOrigin, type Fixture } from "./ports";

// `/download` in every Release state, from exports built with the fixture
// Releases in e2e/fixtures/releases.json (Download experience #13; Copy
// deck, `/download` → Buttons). User agents stand in for the platforms.

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
  },
  prerelease: {
    macos:
      "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_aarch64.dmg",
    windows:
      "https://github.com/getoxide/oxide/releases/download/v1.2.0-rc.1/Oxide_1.2.0-rc.1_x64-setup.exe",
  },
};

const UNSUPPORTED = "Linux, Intel Macs and Windows on ARM aren't packaged yet.";

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

/** The platform buttons in visual order, with their look. */
async function platformButtons(page: Page): Promise<Shown[]> {
  const buttons = page.locator('main a[data-goatcounter-click^="download-"]');
  await expect(buttons).toHaveCount(2);
  const shown = await buttons.evaluateAll((links) => {
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
    (await buttons.all()).map(async (b) =>
      (await b.innerText()).replace(/\s+/g, " ").trim(),
    ),
  );
  return shown
    .map((s, i) => ({ ...s, name: names[i] }))
    .sort((a, b) => a.top - b.top || a.left - b.left)
    .map(({ name, href, primary }) => ({ name, href, primary }));
}

test.describe("stable", () => {
  const mac = {
    name: "Download for macOS",
    href: ASSET.stable.macos,
  };
  const win = {
    name: "Download for Windows",
    href: ASSET.stable.windows,
  };

  test("macOS: macOS primary, Windows secondary", async ({ browser }) => {
    const page = await open(browser, "stable", { ua: UA.mac });
    expect(await platformButtons(page)).toEqual([
      { ...mac, primary: true },
      { ...win, primary: false },
    ]);
    const main = page.locator("main");
    await expect(main).toContainText("Apple Silicon · .dmg · 101.2 MB");
    await expect(main).toContainText("x64 · installer · 88.8 MB");
    await expect(main).toContainText(
      "Version 1.1.0 · 10 December 2026 · Release notes",
    );
    await expect(
      main.getByRole("link", { name: "Release notes" }),
    ).toHaveAttribute("href", "/changelog");
  });

  test("Windows: Windows primary and first, macOS secondary", async ({
    browser,
  }) => {
    const page = await open(browser, "stable", { ua: UA.windows });
    expect(await platformButtons(page)).toEqual([
      { ...win, primary: true },
      { ...mac, primary: false },
    ]);
  });

  test("Windows with JavaScript off: macOS stays primary, both links present", async ({
    browser,
  }) => {
    const page = await open(browser, "stable", { ua: UA.windows, js: false });
    expect(await platformButtons(page)).toEqual([
      { ...mac, primary: true },
      { ...win, primary: false },
    ]);
  });

  test("Linux: the no-JavaScript order and the build-from-source line", async ({
    browser,
  }) => {
    const page = await open(browser, "stable", { ua: UA.linux });
    expect(await platformButtons(page)).toEqual([
      { ...mac, primary: true },
      { ...win, primary: false },
    ]);
    await expect(page.locator("main").getByText(UNSUPPORTED)).toBeVisible();
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
  const LABEL = "Download test pre-release 1.2.0-rc.1";

  test("macOS: the test pre-release is primary, Windows names its platform", async ({
    browser,
  }) => {
    const page = await open(browser, "prerelease-only", { ua: UA.mac });
    expect(await platformButtons(page)).toEqual([
      { name: LABEL, href: ASSET.prerelease.macos, primary: true },
      {
        name: "Download for Windows",
        href: ASSET.prerelease.windows,
        primary: false,
      },
    ]);
    await expect(page.getByRole("link", { name: LABEL })).toHaveCount(1);
    await expect(page.locator("main")).toContainText(
      "This is a test pre-release: it never reaches the in-app updater. Build from source for the latest code.",
    );
    await expect(page.locator("main")).not.toContainText("Release notes");
  });

  test("Windows: the Windows test pre-release is primary", async ({
    browser,
  }) => {
    const page = await open(browser, "prerelease-only", { ua: UA.windows });
    expect(await platformButtons(page)).toEqual([
      { name: LABEL, href: ASSET.prerelease.windows, primary: true },
      {
        name: "Download for macOS",
        href: ASSET.prerelease.macos,
        primary: false,
      },
    ]);
  });

  test("JavaScript off: the macOS test pre-release is primary", async ({
    browser,
  }) => {
    const page = await open(browser, "prerelease-only", {
      ua: UA.windows,
      js: false,
    });
    expect((await platformButtons(page)).map((b) => b.name)).toEqual([
      LABEL,
      "Download for Windows",
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
  ]);
  await expect(page.locator("main")).not.toContainText(/null|undefined/);
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
        name: "Take your next Turn all the way to the merge.",
      });
      // The first button; the block's copy also links its Concepts terms.
      await expect(
        cta.locator('a:not([href^="/docs/concepts#"])').first(),
      ).toHaveText(label);
    });
  }
});

// Budgets, Accessibility, in the states the committed Snapshot cannot show.
for (const fixture of ["stable", "prerelease-only", "unresolved"] as const) {
  for (const [platform, ua] of [
    ["mac", UA.mac],
    ["windows", UA.windows],
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
