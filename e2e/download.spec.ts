import { expect, test } from "@playwright/test";
import { plainText } from "./markdown";
import { SNAPSHOT } from "./snapshot";

// `/download` on the committed Snapshot (Copy deck, `/download`; Download
// experience #13). The other Release states are in download-states.spec.ts.

const FAQ = [
  ["macos-cant-be-opened", "Why does macOS say Oxide can't be opened?"],
  ["verify-download", "How do I check that the download is genuine?"],
  ["which-agent", "Which agent should I install first?"],
  ["updates", "How do I stay up to date?"],
] as const;

const README = `https://github.com/${SNAPSHOT.source.repo}/blob/${SNAPSHOT.source.ref}/README.md`;

test("the blocks come in the Copy deck's order", async ({ page }) => {
  await page.goto("/download");
  const main = page.locator("main");
  await expect(main.locator("h1")).toHaveText("Download Oxide");
  const text = await main.innerText();
  const order = [
    "Bring your own agent",
    "Oxide doesn't ship an agent",
    SNAPSHOT.release.state === "none" ? "Follow on GitHub" : "Download for",
    "macOS blocks the first launch",
    "SmartScreen may warn on first run",
    "Verify your download",
    "Linux, Intel Macs and Windows on ARM aren't packaged yet.",
    FAQ[0][1],
  ];
  const positions = order.map((s) => text.indexOf(s));
  expect(
    positions.every((p) => p >= 0),
    JSON.stringify(positions),
  ).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
});

test("Bring your own agent shows each Provider's install from the Requirements", async ({
  page,
}) => {
  await page.goto("/download");
  const section = page.getByRole("region", { name: "Bring your own agent" });
  const rows = SNAPSHOT.readme.requirements
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .slice(2)
    .map((l) => l.split("|").map((c) => c.trim()));
  expect(rows).toHaveLength(3);
  const items = section.getByRole("listitem");
  await expect(items).toHaveCount(3);
  for (const [i, cells] of rows.entries()) {
    const [provider, install] = [cells[1], cells[3]];
    await expect(items.nth(i)).toContainText(provider);
    await expect(items.nth(i)).toContainText(plainText(install));
    const link = install.match(/\]\(([^)]+)\)/)?.[1];
    if (link) {
      await expect(items.nth(i).getByRole("link")).toHaveAttribute(
        "href",
        link,
      );
    }
  }
});

test("the signing notes, verify link and unsupported line link the README at the pinned ref", async ({
  page,
}) => {
  await page.goto("/download");
  const main = page.locator("main");
  for (const [name, anchor] of [
    ["Verify your download", "verifying-a-download"],
    ["Commands for macOS and Windows", "verifying-a-download"],
    ["How updates work", "updates"],
  ]) {
    await expect(main.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      `${README}#${anchor}`,
    );
  }
  const fullSteps = main.getByRole("link", { name: "Full steps", exact: true });
  await expect(fullSteps).toHaveCount(3);
  for (const href of await fullSteps.evaluateAll((as) =>
    as.map((a) => a.getAttribute("href")),
  )) {
    expect(href).toBe(`${README}#opening-an-unsigned-build`);
  }
  const unsupported = main.getByText(
    "Linux, Intel Macs and Windows on ARM aren't packaged yet.",
  );
  await expect(unsupported).toBeVisible();
  await expect(
    unsupported.getByRole("link", { name: "Build from source" }),
  ).toHaveAttribute("href", `${README}#build-from-source`);
});

test("the page FAQ has four anchored H3 questions with visible answers", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/download#verify-download");
  const questions = page.locator("main h3");
  await expect(questions).toHaveText(FAQ.map(([, q]) => q));
  expect(await questions.evaluateAll((hs) => hs.map((h) => h.id))).toEqual(
    FAQ.map(([id]) => id),
  );
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
      name: "Take your next Turn all the way to the merge.",
    }),
  ).toHaveCount(0);
});
