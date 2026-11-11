import { expect, test } from "@playwright/test";
import { plainText } from "./markdown";
import { SNAPSHOT } from "./snapshot";

// /faq (Content #12 addendum, point 3; Design system, FAQ): the README FAQ
// in its order, each question an anchored heading, each answer visible
// text, never collapsed. Expected text comes from the committed Snapshot.

/** The README FAQ as question/answer pairs, read independently of the site. */
function readmeFaq(): { question: string; answer: string }[] {
  const entries: { question: string; answer: string }[] = [];
  for (const line of SNAPSHOT.readme.faq.split("\n")) {
    const question = /^\*\*(.+)\*\*$/.exec(line)?.[1];
    if (question) entries.push({ question, answer: "" });
    else if (line.trim()) entries.at(-1)!.answer += ` ${plainText(line)}`;
  }
  return entries.map((e) => ({ ...e, answer: e.answer.trim() }));
}

const FAQ = readmeFaq();

test("/faq lists the README questions in order, every answer visible with JavaScript off", async ({
  browser,
}) => {
  expect(FAQ.length).toBeGreaterThan(0);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/faq");
  await expect(page.locator("main h2:not(#closing-cta)")).toHaveText(
    FAQ.map((e) => e.question),
  );
  await expect(page.locator("main details")).toHaveCount(0);
  for (const { question, answer } of FAQ) {
    const section = page.getByRole("region", { name: question });
    await expect(section).toContainText(answer);
    await expect(section.getByText(answer, { exact: false })).toBeVisible();
  }
  await context.close();
});

test("/faq anchors each question; a deep link lands on it with JavaScript off", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/faq");
  const ids = await page
    .locator("main h2:not(#closing-cta)")
    .evaluateAll((hs) => hs.map((h) => h.id));
  expect(ids).toHaveLength(FAQ.length);
  expect(new Set(ids).size).toBe(ids.length);
  for (const [i, id] of ids.entries()) {
    expect(id, FAQ[i].question).toMatch(/^[a-z0-9-]+$/);
    await expect(
      page.getByRole("link", { name: `Link to ${FAQ[i].question}` }),
    ).toHaveAttribute("href", `#${id}`);
  }

  // The last question is the one furthest down the page.
  const last = ids.at(-1)!;
  await page.goto(`/faq#${last}`);
  await expect(page.locator(`h2#${last}`)).toBeInViewport();
  await context.close();
});
