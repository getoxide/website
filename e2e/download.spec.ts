import { expect, test } from "@playwright/test";
import { oxideFileUrl, SNAPSHOT } from "./snapshot";

const FAQ = [
  ["macos-cant-be-opened", "Why does macOS say Oxide can't be opened?"],
  ["verify-download", "How do I check that the download is genuine?"],
  ["linux-packages", "How do Linux packages and updates work?"],
  ["updates", "How do I stay up to date?"],
] as const;

const README = oxideFileUrl("README.md");

test("the blocks come in the Copy deck's order", async ({ page }) => {
  await page.goto("/download");
  const main = page.locator("main");
  await expect(main.locator("h1")).toHaveText("Download Oxide");
  const text = await main.innerText();
  const order = [
    "What Oxide needs",
    "git is required",
    SNAPSHOT.release.state === "none" ? "Follow on GitHub" : "Download for",
    "Linux package repositories",
    "macOS blocks the first launch",
    "SmartScreen may warn on first run",
    "The .rpm is signed with the Oxide repository key",
    "Verify your download",
    "Intel Macs aren't packaged yet.",
    FAQ[0][1],
  ];
  const positions = order.map((s) => text.indexOf(s));
  expect(
    positions.every((p) => p >= 0),
    JSON.stringify(positions),
  ).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
});

test("the Linux APT and DNF repositories are shown on /download", async ({
  page,
}) => {
  await page.goto("/download");
  const repos = page.getByRole("region", {
    name: "Linux package repositories",
  });
  await expect(repos).toContainText("https://updates.getoxide.dev/apt/");
  await expect(repos).toContainText("https://updates.getoxide.dev/rpm/");
});

test("the signing notes, verify link and unsupported line link the README at the pinned ref", async ({
  page,
}) => {
  await page.goto("/download");
  const main = page.locator("main");
  for (const [name, anchor] of [
    ["Verify your download", "verifying-a-download"],
    ["Commands for every platform", "verifying-a-download"],
    ["How updates work", "updates"],
  ]) {
    await expect(main.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      `${README}#${anchor}`,
    );
  }
  const fullSteps = main.getByRole("link", { name: "Full steps", exact: true });
  await expect(fullSteps).toHaveCount(4);
  for (const href of await fullSteps.evaluateAll((as) =>
    as.map((a) => a.getAttribute("href")),
  )) {
    expect(href).toBe(`${README}#opening-an-unsigned-build`);
  }
  const unsupported = main.getByText("Intel Macs aren't packaged yet.");
  await expect(unsupported).toBeVisible();
  await expect(
    unsupported.getByRole("link", { name: "Build from source" }),
  ).toHaveAttribute("href", `${README}#build-from-source`);
});

test("the page FAQ has four anchored H3 questions, each linking to itself, with visible answers", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/download#verify-download");
  const questions = page.locator(
    'main section[aria-labelledby="questions"] h3',
  );
  await expect(questions).toHaveText(FAQ.map(([, q]) => q));
  expect(await questions.evaluateAll((hs) => hs.map((h) => h.id))).toEqual(
    FAQ.map(([id]) => id),
  );
  for (const [id, question] of FAQ) {
    await expect(
      page.getByRole("link", { name: `Link to ${question}` }),
    ).toHaveAttribute("href", `#${id}`);
  }
  await expect(page.locator("h3#verify-download")).toBeInViewport();
  await expect(page.locator("main details")).toHaveCount(0);
  await expect(page.locator("main")).toContainText(
    "Check the hash, or run gh attestation verify on the file.",
  );
  await context.close();
});

test("ends without the closing CTA block", async ({ page }) => {
  await page.goto("/download");
  await expect(
    page.getByRole("heading", {
      name: "Open a folder and start a clean shell.",
    }),
  ).toHaveCount(0);
});
