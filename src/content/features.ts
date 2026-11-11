// `/features`: the feature-name contract (Copy deck, `/features` → The
// feature-name contract). One entry per README Features lead-in, no more, no
// fewer. `leadIn`, `heading`, `anchor` and `keySentences` are the deck's;
// `detail` and `caption` are build-written running text and captions, drafts
// Lorenzo approves in review. Product facts stay in the Snapshot: nothing
// here restates a version, a platform or a definition.
//
// Notation as in the Copy deck: `[label](target)` links, `code`.

export type FeatureLink = { label: string; href: string };

export type Feature = {
  /** The contract key: the README lead-in, as the deck writes it. */
  leadIn: string;
  heading: string;
  /** Published and stable: never renamed without a redirect. */
  anchor: string;
  /** Locked in meaning; the deck's sentences, verbatim. */
  keySentences: string[];
  /** Build-written running text. */
  detail: string;
  /** Shown under the capture when the slot has one. */
  caption: string;
  /** What the capture shows, for the `alt` of its image or video. */
  captureAlt: string;
  /** A guide this section links (Verification Dossier, Blind review). */
  guide?: FeatureLink & { lead: string };
  /** A sentence pointing at another section, kept only if it renders. */
  see?: { anchor: string; sentence: string };
};

export type FeatureGroup = {
  heading: string;
  /** The group key sentence. */
  sentence: string;
  features: Feature[];
};

/**
 * README lead-ins that Oxide does not carry yet. Their sections stay out of
 * the page, and out of the contract test's "missing" report, until the
 * Snapshot has the lead-in. Empty since getoxide/oxide#416 added "Pull
 * requests, from review to merge." to the README; the mechanism stays for the
 * next upstream-first claim.
 */
export const PENDING_UPSTREAM: string[] = [];

/** The capture slot of a feature section: `assets/captures/<slot>.png`. */
export const featureSlot = (anchor: string) => `feature-${anchor}`;

export const FEATURES_INTRO = {
  /** Copy deck: locked in meaning. */
  keySentence:
    "Oxide drives the agent CLIs you already use and puts the review, the checks and the undo next to the conversation, so a finished Turn becomes a merge you can stand behind.",
  /** Build-written running text under the key sentence. */
  detail:
    "Every Thread is a real session of one Provider in a Project. Each Turn is bracketed by Checkpoints, which is what lets the Diff Surface show what it changed, the Verification Dossier say what ran, a Blind review look at it fresh and Restore put it back.",
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    heading: "One app, every agent CLI",
    sentence: "The agents keep doing the work; Oxide gives them one window.",
    features: [
      {
        leadIn: "Multiple Providers.",
        heading: "Claude Code, Codex and Antigravity CLI",
        anchor: "multiple-providers",
        keySentences: [
          "Use the three side by side.",
          "Oxide detects which ones are installed and offers only those.",
        ],
        detail:
          "Each Thread runs the Provider's own CLI, so the login, the subscription and the sessions you already have carry over. Oxide ships no agent of its own.",
        caption: "Starting a Thread with the Provider of your choice.",
        captureAlt:
          "Oxide's new Thread composer with the Provider picker open, listing the agent CLIs found on the machine",
      },
      {
        leadIn: "Threads.",
        heading: "Threads",
        anchor: "threads",
        keySentences: [
          "Each Thread is one conversation with one Provider, mapped one-to-one to that Provider's own session, with its own Model and Effort.",
        ],
        detail:
          "Model and Effort can change between Turns. A Thread you are done with is deleted, not archived, and takes its Transcript and Checkpoints with it.",
        caption: "The Threads of a Project in the sidebar.",
        captureAlt:
          "Oxide's sidebar listing the Threads of one Project, each with the Provider it runs",
      },
      {
        leadIn: "Permission modes.",
        heading: "Permission modes and Approvals",
        anchor: "permission-modes",
        keySentences: [
          "Choose Ask, Auto-edit or Full access per Thread and answer Approvals inline.",
          "The Attention Center collects every Thread waiting on you, across Projects.",
        ],
        detail:
          "The mode belongs to the Thread, so a careful Thread and a hands-off one can sit side by side in the same Project.",
        caption: "An Approval waiting inline in the conversation.",
        captureAlt:
          "Oxide's conversation with an Approval request shown inline, with its allow and deny buttons",
      },
      {
        leadIn: "Slash commands, attachments and usage limits.",
        heading: "Slash commands, attachments and usage limits",
        anchor: "slash-commands",
        keySentences: [
          "Each Provider's Slash commands and skills in the composer, files and images in the prompt, and the usage limits your Provider reports.",
        ],
        detail:
          "What the composer offers follows the Provider of the Thread you are in, so a Claude Code Thread and a Codex Thread each show their own.",
        caption: "The composer with its Slash command menu open.",
        captureAlt:
          "Oxide's composer with the Slash command menu open above the prompt field",
      },
      {
        leadIn: "Worktrees.",
        heading: "Worktrees",
        anchor: "worktrees",
        keySentences: [
          "A Thread can work in its own Git worktree, with an optional setup command per Project, so parallel work never collides.",
        ],
        detail:
          "Deleting a Thread removes its worktree with it; the branch stays.",
        caption: "A Thread working in a worktree of its own.",
        captureAlt:
          "Oxide's Thread header showing the worktree and branch the Thread works in",
      },
    ],
  },
  {
    heading: "Review before you merge",
    sentence:
      "The part most agent tools leave to you: seeing what changed, what was checked and what stayed unverified.",
    features: [
      {
        leadIn: "Verification Dossier.",
        heading: "Verification Dossier",
        anchor: "verification-dossier",
        keySentences: [
          "Which Verification commands ran and whether they're still fresh, which languages no check covers, source changed without a test change, sensitive paths.",
          "Computed without an LLM, shown as separate signals, never a score; the agent's closing message stays apart as a claim.",
        ],
        detail:
          "It is a section of the Diff Surface, computed from the Transcript, the Checkpoints, your Settings and GitHub.",
        caption: "The Verification Dossier beside the diff of a Turn.",
        captureAlt:
          "Oxide's Diff Surface with the Verification Dossier open, listing the checks that ran, which are stale and what no check covers",
        guide: {
          lead: "To put it to work:",
          label: "how to review AI-generated code",
          href: "/guides/review-ai-generated-code",
        },
      },
      {
        leadIn: "Blind review.",
        heading: "Blind review",
        anchor: "blind-review",
        keySentences: [
          "A second Provider reviews the change seeing only the diff and the issue, never the original Thread.",
          "Its findings become Line comments you keep or dismiss.",
        ],
        detail:
          "The reviewer is a separate session, so it judges the change on its own terms instead of inheriting the assumptions of the conversation that wrote it.",
        caption: "Findings from a Blind review, ready to keep or dismiss.",
        captureAlt:
          "Oxide's Diff Surface with the findings of a Blind review shown as Line comments to keep or dismiss",
        guide: {
          lead: "To try it:",
          label: "Claude Code and Codex together",
          href: "/guides/claude-code-and-codex-together",
        },
      },
      {
        leadIn: "Diff by Turn, Uncommitted or Branch.",
        heading: "Diff by Turn",
        anchor: "diff-by-turn",
        keySentences: [
          "See exactly what one Turn changed, thanks to Checkpoints taken when it starts and ends.",
          "Switch to everything uncommitted or the whole branch.",
        ],
        detail:
          "One prompt, one diff: small enough to read, and exact because it is measured between two Checkpoints rather than guessed from the transcript.",
        caption: "The diff of one Turn, with the scope switcher above it.",
        captureAlt:
          "Oxide's Diff Surface showing the changes of a single Turn, with the Turn, Uncommitted and Branch scopes to switch between",
      },
      {
        leadIn: "Line comments.",
        heading: "Line comments",
        anchor: "line-comments",
        keySentences: [
          "Comment on any line of the Diff and send the comments back to the Thread as one prompt, or submit them to GitHub as a pull request review.",
        ],
        detail:
          "The findings of a Blind review arrive in the same form, so you handle the reviewer's comments the way you handle your own.",
        caption: "Line comments collected on a diff, before they are sent.",
        captureAlt:
          "Oxide's Diff Surface with comments attached to several lines and a button to send them back to the Thread",
      },
      {
        leadIn: "Revert and Restore.",
        heading: "Revert and Restore",
        anchor: "restore",
        keySentences: [
          "Revert takes out one file or hunk; Restore puts a Thread's files back to how they were before any Turn.",
          "Both can be undone.",
        ],
        detail:
          "Restore asks first, naming the files it will change, and takes a Checkpoint before it acts, which is why it can be undone. It does not rewind the Provider's session.",
        caption: "Restore asking before it puts the files of a Thread back.",
        captureAlt:
          "Oxide's confirmation before a Restore, naming the files it will change",
      },
      {
        leadIn: "Rule suggestions.",
        heading: "Rule suggestions",
        anchor: "rule-suggestions",
        keySentences: [
          "Feedback you keep giving becomes a proposed rule for the Project's `AGENTS.md`.",
        ],
        detail: "Say a correction once instead of in every Thread.",
        caption: "A proposed rule for the Project's AGENTS.md.",
        captureAlt:
          "Oxide proposing a rule for the Project's AGENTS.md file from repeated feedback",
      },
      {
        leadIn: "Pull requests, from review to merge.",
        heading: "Pull requests",
        anchor: "pull-requests",
        keySentences: [
          "Open the pull request from the Pull request Surface and submit Line comments to GitHub as a review.",
          "Fix sends failing checks, conflicts and the review threads you pick back to the agent, in the branch's Thread or a new one.",
          "Merge, squash or rebase when GitHub says it's ready, or turn on auto-merge while checks run.",
        ],
        detail:
          "The Pull request Surface works from the Project's repository; the actions on a branch act on the checkout of the Thread you have selected.",
        caption: "The Pull request Surface with a pull request ready to merge.",
        captureAlt:
          "Oxide's Pull request Surface showing a pull request with its checks and the merge options",
      },
    ],
  },
  {
    heading: "A full workspace around the conversation",
    sentence: "Everything the review needs, without a second app open.",
    features: [
      {
        leadIn: "Git and GitHub.",
        heading: "Git and GitHub",
        anchor: "git-and-github",
        keySentences: [
          "Branches, commit and push, and Issues, through `git` and the GitHub CLI.",
        ],
        detail:
          "`git` is required; the GitHub CLI, logged in, is what switches on the GitHub features.",
        caption: "Committing and pushing from the Diff Surface.",
        captureAlt:
          "Oxide's Diff Surface with the commit message field and the Commit and Push button",
        see: {
          anchor: "pull-requests",
          sentence:
            "Pull requests have their own section, [Pull requests](#pull-requests).",
        },
      },
      {
        leadIn: "Code editor.",
        heading: "Code editor",
        anchor: "code-editor",
        keySentences: [
          "A Monaco editor with language servers, installed on first use and only when you press Install.",
        ],
        detail:
          "Files is a navigator: it opens what you pick in the Code workspace, in the centre beside the Thread.",
        caption: "A file open in the code editor beside a Thread.",
        captureAlt:
          "Oxide's Code workspace with a source file open in the editor, next to the Thread",
      },
      {
        leadIn: "Terminal.",
        heading: "Terminal",
        anchor: "terminal",
        keySentences: [
          "Terminal tabs per Project with Command blocks, kept alive while you switch Threads.",
        ],
        detail: "It is one of the Surfaces in the right dock, like the Diff.",
        caption: "Terminal tabs with Command blocks.",
        captureAlt:
          "Oxide's Terminal Surface with several tabs and the output of a command grouped in a Command block",
      },
      {
        leadIn: "Local dictation.",
        heading: "Local dictation",
        anchor: "dictation",
        keySentences: [
          "Speak into the composer or the terminal; on-device Whisper models, and the audio never leaves your machine.",
        ],
        detail:
          "Dictation runs fully on the device, so it needs no account and sends nothing anywhere.",
        caption: "Dictating a prompt into the composer.",
        captureAlt:
          "Oxide's composer while a prompt is being dictated, with the recording indicator on",
      },
      {
        leadIn: "Keyboard first.",
        heading: "Keyboard first",
        anchor: "keyboard",
        keySentences: [
          "Full keyboard navigation, themes and reduced-motion support.",
        ],
        detail:
          "The Project palette, for one, opens straight from the keyboard.",
        caption: "The Project palette, opened from the keyboard.",
        captureAlt:
          "Oxide's Project palette open over the window, listing folders to open",
      },
    ],
  },
];
