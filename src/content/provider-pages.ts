// `/claude-code-gui` and `/codex-gui` (Copy deck, the two page sections). The
// intro key sentences and the page FAQs are locked and verbatim; the section
// headings are the outline's and the running text is build-written, a draft
// Lorenzo approves in review. Strings keep the deck's notation
// (`[label](target)`, `` `code` ``): `<DeckText>` renders them. The
// `⟨platforms⟩` token is substituted at render time from the Snapshot.
//
// Concept links (Copy deck rule 4): the first mention of a Concepts term on a
// page links to `/docs/concepts`, so the first mention of Verification
// Dossier and Blind review is plain text, and the link to `/features` sits on
// a later phrase.

export type ProviderSection = {
  /** Anchor of the section's heading. */
  id: string;
  /** The outline's heading, verbatim. */
  heading: string;
  /** Markdown paragraphs. */
  paragraphs: string[];
};

export type ProviderFaq = { id: string; question: string; answer: string };

export type ProviderPageCopy = {
  /** The locked intro key sentence, directly under the H1. */
  intro: string;
  sections: ProviderSection[];
  faq: ProviderFaq[];
  /** Capture slot shown after the first section, if its source exists. */
  captureSlot: string;
};

const REVIEW_GUIDE = "/guides/review-ai-generated-code";
const TOGETHER_GUIDE = "/guides/claude-code-and-codex-together";

export const PROVIDER_PAGES = {
  claudeCode: {
    intro:
      "Oxide is a desktop GUI for the `claude` CLI you already have: the same login, the same sessions, with each Turn's changes and checks in view.",
    captureSlot: "claude-code-turn",
    sections: [
      {
        id: "what-oxide-adds-to-claude-code",
        heading: "What Oxide adds to Claude Code",
        paragraphs: [
          "Every Turn gets its own diff, so you read what one prompt changed instead of scrolling a transcript. Oxide takes a Checkpoint when the Turn starts and another when it ends, which is what makes that diff exact.",
          `The Verification Dossier shows which checks actually ran, which went stale and what no check covers: [see what the Dossier shows](/features#verification-dossier). Line comments go back to Claude Code as one prompt.`,
        ],
      },
      {
        id: "what-stays-the-same",
        heading: "What stays the same",
        paragraphs: [
          "Claude Code still does the work, with your login and your plan. Each Thread maps one-to-one to a Claude Code session, and its Slash commands and skills are in the composer.",
          "Oxide drives the CLI rather than replacing it: install Claude Code once, and it shows up as a Provider.",
        ],
      },
      {
        id: "undo-a-turn-not-just-a-file",
        heading: "Undo a Turn, not just a file",
        paragraphs: [
          "Restore puts the files back to how they were before any Turn, and the Restore itself can be undone. Claude Code is told on its next prompt which files went back.",
          "To take out one file or one hunk instead, use Revert: [Revert and Restore](/features#restore) covers both.",
        ],
      },
      {
        id: "let-another-provider-review-it",
        heading: "Let another Provider review it",
        paragraphs: [
          "Have Codex or Antigravity CLI review Claude Code's change in a Blind review, seeing only the diff and the issue. Its findings become Line comments you keep or dismiss.",
          `[How a Blind review works](/features#blind-review), and the full setup in [Claude Code and Codex together](${TOGETHER_GUIDE}).`,
        ],
      },
      {
        id: "gui-or-terminal",
        heading: "GUI or terminal?",
        paragraphs: [
          "The terminal is still the fastest way to fire off a prompt. A GUI pays off at review time: per-Turn diffs, the Dossier, comments on lines and the pull request in one window.",
          `[How to review AI-generated code](${REVIEW_GUIDE}) is the method behind it, with or without Oxide.`,
        ],
      },
    ],
    faq: [
      {
        id: "install-claude-code-first",
        question: "Do I need Claude Code installed first?",
        answer:
          "Yes. Oxide drives the `claude` CLI; it doesn't replace it. Install Claude Code and log in once in a terminal, then launch Oxide and it shows up as a Provider. [Requirements](/docs/quick-start#requirements).",
      },
      {
        id: "slash-commands-and-skills",
        question: "Can I keep using my Slash commands and skills?",
        answer:
          "Yes. The composer lists Claude Code's own Slash commands and skills, because the Thread is a real Claude Code session, not an imitation of one.",
      },
      {
        id: "permission-modes",
        question: "How do permission modes map to Claude Code?",
        answer:
          "Each Thread runs in Ask, Auto-edit or Full access, and you can change the mode between Turns. When Claude Code asks for an Approval, you answer it inline; the Attention Center lists every Thread waiting on you.",
      },
      {
        id: "windows",
        question: "Does Oxide work with Claude Code on Windows?",
        answer:
          "Yes. Oxide runs on `⟨platforms⟩`, and on Windows it drives the `claude` CLI installed there, with the same Diff, Dossier and Restore as on macOS.",
      },
      {
        id: "sessions",
        question: "What happens to my Claude Code sessions?",
        answer:
          "Each Thread maps one-to-one to a Claude Code session. Deleting a Thread removes Oxide's own record of it (Transcript, Checkpoints, worktree) and leaves Claude Code's session files alone.",
      },
    ],
  },

  codex: {
    intro:
      "Yes, there is a GUI for Codex: Oxide drives the `codex` CLI you already use and shows which checks actually ran before you merge.",
    captureSlot: "codex-dossier",
    sections: [
      {
        id: "tests-pass-is-a-claim",
        heading: '"Tests pass" is a claim',
        paragraphs: [
          "Codex's closing message says what it believes it did. The Verification Dossier keeps that message apart and shows which Verification commands actually ran, which are stale and what no check covers.",
          `Nothing in it is a score, and no LLM computes it: [how the Dossier is built](/features#verification-dossier).`,
        ],
      },
      {
        id: "codex-next-to-claude-code",
        heading: "Codex next to Claude Code",
        paragraphs: [
          "Run Codex and Claude Code in the same Project, one Thread each, each with its own Model and Effort. Let one write and the other run a Blind review: the reviewer sees only the diff and the issue, never the writer's conversation.",
          `[How a Blind review works](/features#blind-review), and the full setup in [Claude Code and Codex together](${TOGETHER_GUIDE}).`,
        ],
      },
      {
        id: "what-stays-the-same",
        heading: "What stays the same",
        paragraphs: [
          "Codex still does the work, with your login and your plan. Its Slash commands are in the composer, and the usage limits Codex reports are shown next to the Thread.",
          "Oxide drives the CLI rather than replacing it: install Codex once, and it shows up as a Provider.",
        ],
      },
      {
        id: "from-the-diff-to-the-pull-request",
        heading: "From the diff to the pull request",
        paragraphs: [
          "Review the change, leave Line comments, commit, push and open the pull request without switching to a browser.",
          `[How to review AI-generated code](${REVIEW_GUIDE}) is the method behind it, with or without Oxide.`,
        ],
      },
    ],
    faq: [
      {
        id: "install-codex-first",
        question: "Do I need the Codex CLI installed first?",
        answer:
          "Yes. Oxide drives the `codex` CLI rather than replacing it. Install Codex, log in once in a terminal, then launch Oxide and Codex appears as a Provider. [Requirements](/docs/quick-start#requirements).",
      },
      {
        id: "model-and-effort",
        question: "Can I choose the Codex model and reasoning effort?",
        answer:
          "Yes. Every Thread has its own Model and Effort, picked when you start it and changeable between Turns.",
      },
      {
        id: "usage-limits",
        question: "Does Oxide show my Codex usage limits?",
        answer:
          "Yes, when Codex reports them: the 5-hour and weekly limits appear in the app, so you see how much is left before you start a long Turn.",
      },
      {
        id: "windows",
        question: "Does Oxide work with Codex on Windows?",
        answer:
          "Yes. Oxide runs on `⟨platforms⟩`, and on Windows it drives the `codex` CLI installed there.",
      },
      {
        id: "claude-code-reviews-codex",
        question: "Can Claude Code review what Codex wrote?",
        answer:
          "Yes. Start a Blind review and pick Claude Code as the reviewer: it sees only the diff and the issue, never the Codex conversation, and its findings become Line comments you keep or dismiss. [The full workflow](/guides/claude-code-and-codex-together).",
      },
    ],
  },
} as const satisfies Record<string, ProviderPageCopy>;
