import { describe, expect, it } from "vitest";
import { faqOf } from "./faq";
import { SNAPSHOT, type Snapshot } from "./snapshot";

const withFaq = (faq: string): Snapshot => ({
  ...SNAPSHOT,
  readme: { ...SNAPSHOT.readme, faq },
});

describe("faqOf (Content #12 addendum: the general FAQ comes only from the README)", () => {
  it("lists the README questions in order, each with its answer and an anchor", () => {
    const faq = faqOf(
      withFaq(
        [
          "**What is Oxide?**",
          "Oxide is a desktop GUI.",
          "",
          "**Do I need an API key?**",
          "No separate key for Oxide.",
        ].join("\n"),
      ),
    );
    expect(faq).toEqual([
      {
        question: "What is Oxide?",
        id: "what-is-oxide",
        answer: "Oxide is a desktop GUI.",
      },
      {
        question: "Do I need an API key?",
        id: "do-i-need-an-api-key",
        answer: "No separate key for Oxide.",
      },
    ]);
  });

  it("keeps every paragraph and link of a multi-paragraph answer", () => {
    const [entry] = faqOf(
      withFaq(
        [
          "**How is it different from using Claude Code or Codex in a terminal?**",
          "You keep the same CLIs.",
          "",
          "- One list item, see [the docs](https://example.com).",
        ].join("\n"),
      ),
    );
    expect(entry.id).toBe(
      "how-is-it-different-from-using-claude-code-or-codex-in-a-terminal",
    );
    expect(entry.answer).toBe(
      "You keep the same CLIs.\n\n- One list item, see [the docs](https://example.com).",
    );
  });

  it("gives repeated questions distinct anchors", () => {
    const ids = faqOf(
      withFaq("**Is it free?**\nYes.\n\n**Is it free?**\nStill yes."),
    ).map((e) => e.id);
    expect(ids).toEqual(["is-it-free", "is-it-free-1"]);
  });

  it("fails the build on text before the first question", () => {
    expect(() => faqOf(withFaq("Intro.\n\n**Q?**\nA."))).toThrow(/FAQ/);
  });

  // Structural only, so a daily sync that changes the README FAQ never fails
  // here: one entry per bold question line, none without an answer.
  it("reads every question of the committed Snapshot, each with an answer", () => {
    const faq = faqOf(SNAPSHOT);
    const bold = SNAPSHOT.readme.faq
      .split("\n")
      .filter((l) => /^\*\*.+\*\*$/.test(l));
    expect(faq.length).toBeGreaterThan(0);
    expect(faq).toHaveLength(bold.length);
    for (const entry of faq) expect(entry.answer, entry.question).not.toBe("");
  });
});
