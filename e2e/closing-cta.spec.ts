import { expect, test } from "@playwright/test";
import { REGISTERED, urlOf } from "./pages";
import { SNAPSHOT } from "./snapshot";

// Copy deck, Closing CTA block; Page inventory #9, internal linking rule 1:
// every page except /download ends with the same block.
const HEADING = "Take your next Turn all the way to the merge.";
const PRIMARY =
  SNAPSHOT.release.state === "none" ? "Get Oxide" : "Download Oxide";

const WITH_CTA = REGISTERED.filter((p) => p.path !== "/download");

/** The block's two buttons; its copy also links its Concepts terms. */
const BUTTONS = 'a:not([href^="/docs/concepts#"])';

test("the closing CTA block is identical on every page that carries it", async ({
  page,
}) => {
  const blocks = new Set<string>();
  for (const entry of WITH_CTA) {
    await page.goto(urlOf(entry));
    const cta = page.getByRole("region", { name: HEADING });
    await expect(cta, entry.path).toHaveCount(1);
    blocks.add(await cta.evaluate((el) => el.outerHTML));
  }
  expect(blocks.size).toBe(1);
});

for (const entry of WITH_CTA) {
  test(`${entry.path}: ends with the closing CTA, primary "${PRIMARY}"`, async ({
    page,
  }) => {
    await page.goto(urlOf(entry));
    const main = page.locator("main");
    const cta = main.getByRole("region", { name: HEADING });
    await expect(cta).toBeVisible();
    // The block is the last thing in the main landmark.
    expect(
      await main.evaluate((m) => m.lastElementChild?.tagName.toLowerCase()),
    ).toBe("section");
    await expect(main.locator("> section").last()).toHaveAttribute(
      "aria-labelledby",
      "closing-cta",
    );
    const buttons = cta.locator(BUTTONS);
    await expect(buttons).toHaveText([PRIMARY, "View on GitHub"]);
    await expect(buttons.first()).toHaveAttribute("href", "/download");
    await expect(buttons.last()).toHaveAttribute(
      "href",
      "https://github.com/getoxide/oxide",
    );
  });
}
