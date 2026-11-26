// `/features`: the feature-name contract (Copy deck, `/features` → The
// feature-name contract). One entry per README Features lead-in, no more, no
// fewer. `leadIn`, `heading`, `anchor` and `keySentences` are the deck's;
// `detail` and `caption` are build-written running text and captions, drafts
// Lorenzo or Matteo approves in review. Product facts stay in the Snapshot: nothing
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
  /** A guide this section links. */
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

export const PENDING_UPSTREAM: string[] = [];

/** The capture slot of a feature section: `assets/captures/<slot>.png`. */
export const featureSlot = (anchor: string) => `feature-${anchor}`;

export const FEATURES_INTRO = {
  /** Copy deck: locked in meaning. */
  keySentence:
    "Oxide gives every GitHub Project a clean set of plain terminals, a side-by-side code editor and GitHub tools in one window.",
  /** Build-written running text under the key sentence. */
  detail:
    "A Terminal is a plain shell owned by Core, so any CLI you run — `claude`, `codex`, `agy`, a dev server or a test runner — behaves just like it does outside Oxide, while Files view, the Code workspace and GitHub Surfaces stay at hand.",
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    heading: "Projects and plain terminals",
    sentence:
      "Open a Project, open as many clean shells as you like in its folder, and run whatever you want in them.",
    features: [
      {
        leadIn: "Open Projects.",
        heading: "Open Projects",
        anchor: "open-projects",
        keySentences: [
          "The sidebar lists the Open Projects and, under each, its Terminals.",
          "A New terminal control on a Project opens a fresh shell already in its folder.",
        ],
        detail:
          "Use the Project palette to search local repositories, run `git init` in a new folder, or clone from GitHub through `gh`. Closing a Project ends its Terminals and keeps the Project known.",
        caption:
          "The Project palette over the sidebar listing Open Projects and their Terminals.",
        captureAlt:
          "Oxide's Project palette open over the sidebar, searching local and GitHub repositories",
      },
      {
        leadIn: "Many terminals.",
        heading: "Many terminals",
        anchor: "many-terminals",
        keySentences: [
          "Run a server, an agent CLI and a test watcher side by side.",
          "The selected Terminal fills the centre; switching keeps each one's scrollback, working directory and running process.",
        ],
        detail:
          "Rename any Terminal in place from the sidebar, or let it show the long-running program automatically. With Session restore on, Oxide reopens your Terminals and recent Command blocks after a restart.",
        caption:
          "Multiple Terminals nested under a Project in the sidebar, with a plain shell in the centre.",
        captureAlt:
          "Oxide showing multiple Terminals under one Project in the sidebar and the active shell in the centre",
        guide: {
          lead: "To run coding agents in them:",
          label: "running Claude Code, Codex and any CLI in Oxide",
          href: "/guides/running-agents-in-oxide",
        },
      },
      {
        leadIn: "Command blocks.",
        heading: "Command blocks",
        anchor: "command-blocks",
        keySentences: [
          "The Warp-like grouping of command, output and exit status.",
          "Each Command block belongs to a persistent shell session.",
        ],
        detail:
          "Your working directory and shell variables carry from one Command block to the next. Bare `Ctrl+<letter>` and standard terminal control keys go straight to the PTY when a Terminal has focus.",
        caption:
          "Command blocks grouping each command with its output and exit status.",
        captureAlt:
          "Oxide's Terminal showing multiple Command blocks with grouped output and exit status badges",
      },
    ],
  },
  {
    heading: "GitHub at hand",
    sentence:
      "Browse files, edit code beside your terminal and handle GitHub Issues and pull requests without leaving the window.",
    features: [
      {
        leadIn: "Issues.",
        heading: "Issues",
        anchor: "issues",
        keySentences: [
          "List, read and create GitHub Issues for the Project through the GitHub CLI, with labels, sub-issues and the Activity Timeline.",
        ],
        detail:
          "Issues is one of the two Surfaces in the right dock, talking directly to GitHub through your own `gh` login.",
        caption:
          "The Issues Surface showing issue details, labels, sub-issues and the Activity Timeline.",
        captureAlt:
          "Oxide's Issues Surface in the right dock displaying an open GitHub issue with labels and comments",
      },
      {
        leadIn: "Pull requests.",
        heading: "Pull requests",
        anchor: "pull-requests",
        keySentences: [
          "List, read, create, review and merge pull requests, check CI status, or turn on auto-merge while checks run.",
        ],
        detail:
          "The Pull request Surface lives beside Issues in the right dock, keeping reviews, checks, timeline comments and merge controls next to your Terminals.",
        caption:
          "The Pull request Surface with CI checks, review status and merge controls.",
        captureAlt:
          "Oxide's Pull request Surface in the right dock showing checks, review status and merge options",
      },
      {
        leadIn: "Files.",
        heading: "Files and Code workspace",
        anchor: "files",
        keySentences: [
          "Browse the Project's folder from the Files view on its sidebar row and open a file in the Code workspace beside the Terminal, with on-demand language servers.",
        ],
        detail:
          "Opening a file splits the centre into a Terminal half and a Code half with a draggable divider, and each half can be maximized and restored. Language servers for Rust, TypeScript/JavaScript, Python and C/C++ install only when you press Install.",
        caption:
          "The Files view in the sidebar with the split Terminal and Code workspace in the centre.",
        captureAlt:
          "Oxide with the Files view open in the sidebar and a split centre showing the Terminal beside the Monaco Code workspace",
      },
    ],
  },
];
