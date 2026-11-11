// The two guides (ticket #42; Copy deck, the guides' outlines). The headings,
// the intro key sentences and the meaning of each section's key sentences are
// the deck's; the running text around them is build-written and Lorenzo
// approves it in review. The second guide is honest about the cost of a
// second agent and about doing it without Oxide.
//
// Notation as in the Copy deck: `[label](target)` links, `code`, `**bold**`.
import type { Page } from "./pages";
import { PAGES } from "./pages";

export type GuideSection = {
  /** Published anchor of the section heading, stable once shipped. */
  id: string;
  /** The Copy deck's outline heading, verbatim. */
  heading: string;
  /** Build-written running text; the deck's key sentences come first. */
  body: string;
};

export type Guide = {
  /** The registry entry: the locked H1, title and description. */
  page: Page;
  /** A one-line summary for the /guides index (build-written). */
  summary: string;
  /** The deck's intro key sentence, rendered as the page lead. */
  intro: string;
  /** The outline sections, in the deck's order. */
  sections: GuideSection[];
  /** A closing paragraph after the outline (the second guide's cross-link). */
  closing?: string;
};

/** The /guides index: a lead, then one entry per guide. */
export const GUIDE_INDEX = {
  lead: "Two guides to the work that starts when an agent says it is done: a method for reading the change, and a way to put a second agent on the review.",
} as const;

/**
 * Every Markdown source of a guide, in the order the page renders them:
 * the intro, then each section's heading and body, then the closing.
 */
export function guideSources(guide: Guide): string[] {
  return [
    guide.intro,
    ...guide.sections.flatMap((section) => [section.heading, section.body]),
    ...(guide.closing ? [guide.closing] : []),
  ];
}

export const GUIDES: Guide[] = [
  {
    page: PAGES.guidesReview,
    summary:
      "A four-step method for reading the change a piece at a time, checking what ran, commenting on lines and undoing what you don't want.",
    intro:
      "An agent's summary tells you what it believes it did. Reviewing AI-generated code means checking what it actually changed and what actually ran, one Turn at a time.",
    sections: [
      {
        id: "treat-the-summary-as-a-claim",
        heading: "Treat the summary as a claim",
        body: `"Done, tests pass" is a sentence, not evidence. Start from the diff and the commands that ran, and read the summary last.

The closing message comes from the same model that wrote the code, so it repeats the same assumptions. It is a useful index of what to look at, not proof that the work is finished. The evidence lives in two places: the diff, which shows the exact lines that changed, and the record of what ran after the last edit.`,
      },
      {
        id: "read-one-turn-at-a-time",
        heading: "1. Read one Turn at a time",
        body: `A Turn is one prompt and everything the agent did in response. Reviewing per Turn keeps each diff small enough to read; in Oxide, Checkpoints make each Turn's diff exact ([Diff by Turn](/features#diff-by-turn)).

A diff of the whole Thread hides the order of events: a change that looked reasonable in one prompt can quietly become a wrong direction by the third. Per Turn, you can see which instruction produced which lines, and stop a bad direction before the next prompt builds on it. If a Turn went the wrong way, Restore puts the files back to the Checkpoint from before it and leaves the rest alone. What ran, and whether that run still covers the change, is the Verification Dossier's job.`,
      },
      {
        id: "check-what-actually-ran",
        heading: "2. Check what actually ran",
        body: `Look for which tests, type checks and builds ran after the last edit, which went stale, and which languages or paths no check covers. That is what the [Verification Dossier](/features#verification-dossier) computes, without an LLM.

A green check from before the final edit says nothing about the code you are about to merge. Ask three questions of every change: did a check run, did it cover the file that changed, and did it run after the last line changed? Files with no covering check are the ones to read yourself.`,
      },
      {
        id: "send-feedback-where-it-belongs",
        heading: "3. Send feedback where it belongs",
        body: `Comments on lines, not paragraphs of chat. Send them back to the agent as one prompt, or to the pull request as a review ([Line comments](/features#line-comments)).

Feedback written in the conversation loses the line it refers to, and the agent has to guess. A comment pinned to the line survives the round trip: the agent sees the exact code and the exact request, and the next Turn is smaller. Group the comments into one prompt before you send them, so the agent answers them together instead of one at a time.`,
      },
      {
        id: "undo-what-you-dont-want",
        heading: "4. Undo what you don't want",
        body: `Take out one hunk or one file, or put everything back to before a Turn, and keep the rest ([Revert and Restore](/features#restore)).

Not every unwanted change deserves another prompt. Cut the part you don't want, keep what you do, and ask the agent again with less to work with. Both actions can be undone, so it is safe to try the smaller cut first.`,
      },
      {
        id: "before-you-merge",
        heading: "Before you merge",
        body: `A short checklist: every Turn read, every Risk signal looked at, checks fresh on the final commit. Optionally publish the Dossier in the pull request body so reviewers see the same evidence.

In practice:

- **Every Turn read.** Review the newest first, so you know what the branch adds.
- **Every Risk signal looked at.** Explain it, fix it, or remove the change that caused it.
- **Checks fresh on the final commit.** A pass from an earlier Turn does not cover the last edit.
- **The Verification Dossier published**, if your team wants the same evidence in the pull request.`,
      },
      {
        id: "going-further-a-second-reviewer",
        heading: "Going further: a second reviewer",
        body: `A reviewer that didn't write the change catches a different class of problem, and you can add one without leaving the workflow. [Claude Code and Codex together](/guides/claude-code-and-codex-together) shows how to set up a second agent as the reviewer, what it sees, and when the extra usage is worth it.`,
      },
    ],
  },
  {
    page: PAGES.guidesCodex,
    summary:
      "Let Claude Code write and Codex review, or the other way round, with the reviewer seeing only the diff and the issue.",
    intro:
      "Claude Code and Codex are different agents with different blind spots. Let one write the change and have the other review it, seeing only the diff and the issue.",
    sections: [
      {
        id: "why-a-second-agent",
        heading: "Why a second agent",
        body: `A reviewer that didn't write the change, from a different model, catches what the author's context hides.

Every agent has habits: the files it reaches for, the tests it trusts, the edge cases it assumes away. A different model has different habits, so its read of the change covers ground the writer never looked at. The value is not a second opinion on style but a check on the assumptions the first agent never wrote down.`,
      },
      {
        id: "why-the-reviewer-works-blind",
        heading: "Why the reviewer works blind",
        body: `The reviewer should see what the change is meant to do and what it actually does, and nothing about how the writer got there. A reviewer that reads the original conversation inherits its assumptions. Given only the diff and the issue, it judges the change on its own terms. That is a [Blind review](/features#blind-review).

The conversation is where the writer explained away the shortcuts, so a reviewer that reads it starts from the same conclusions. Blind, it has to reconstruct the intent from the issue and check whether the diff delivers it.`,
      },
      {
        id: "set-it-up",
        heading: "Set it up",
        body: `Both Providers installed and logged in. One Thread with the writer; when its Turn finishes, start a Blind review and pick the other Provider.

In Oxide: open the Project, start a Thread with Claude Code or Codex, and give it the issue. When the Turn ends, open the diff, start a Blind review and choose the other agent as the reviewer. Codex can review a Claude Code change and Claude Code can review a Codex change; the direction does not matter, as long as the reviewer is not the writer.`,
      },
      {
        id: "read-the-findings",
        heading: "Read the findings",
        body: `The reviewer's findings arrive as Line comments on the Diff. Keep the ones that hold up, dismiss the rest, and send the kept ones back to the writer as one prompt.

Read a finding as a claim to verify, not a fix to apply. Keep it when it names a real problem: a missed edge case, a test that asserts the wrong thing, a change that reaches outside the issue. Dismiss the style preferences the writer's own instructions already cover. Send the kept comments back together, so the writer answers them in a single Turn.`,
      },
      {
        id: "when-its-worth-it",
        heading: "When it's worth it",
        body: `A Blind review spends usage on a second Provider. Use it where it pays: changes that touch sensitive paths, trigger Risk signals, or lack tests.

A review of every Turn doubles the tokens for the Thread and adds a wait before you merge. Spend it on the changes where a miss is expensive: authentication, payments, data migrations, files with no tests, and anything the Verification Dossier flags. For a copy fix or a dependency bump, your own read is usually enough.`,
      },
      {
        id: "without-oxide",
        heading: "Without Oxide",
        body: `You can do this by hand: give the second agent a fresh session with only the diff and the issue, and paste its findings back. Oxide removes the copying and keeps the reviewer from seeing the conversation.

The manual version is the same method with more steps: export the diff and the issue into a fresh session, ask the reviewer to comment line by line, then paste the findings into the writer's conversation. It works. What you lose is the certainty that the reviewer never saw the original Thread, and the time spent moving text between two windows.`,
      },
    ],
    closing:
      "If you'd rather start from the review itself, [How to review AI-generated code](/guides/review-ai-generated-code) covers the four steps that come before and after a second reviewer.",
  },
];
