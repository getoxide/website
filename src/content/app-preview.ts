// The live app preview (Design system, App preview): one scripted Turn in a
// faithful DOM rendition of the Oxide workbench, the same scene as the hero
// Capture (`assets/captures/hero.png`). This is product UI, not site copy:
// the preview is marked `data-capture`, so the copy gates read it as they
// read a Capture's pixels. The scene is shared; only the Provider changes.

export type PreviewProvider = "claude" | "codex" | "antigravity";

/** What changes with the Provider: the model line and the composer chip. */
export const PREVIEW_PROVIDERS: Record<
  PreviewProvider,
  { model: string; chip: string }
> = {
  claude: { model: "claude-sonnet-4-6 · medium", chip: "Sonnet 4.6 · Medium" },
  codex: { model: "gpt-5-codex · medium", chip: "GPT-5 Codex · Medium" },
  antigravity: { model: "gemini-3-pro · high", chip: "Gemini 3 Pro · High" },
};

export const PREVIEW = {
  /** The accessible name of the whole preview, as a Capture's alt. */
  label: (provider: PreviewProvider) =>
    `Oxide running a ${
      { claude: "Claude Code", codex: "Codex", antigravity: "Antigravity CLI" }[
        provider
      ]
    } Thread: a prompt, the agent's Turn, its diff and Verification checks, then the pull request merged`,
  pause: "Pause preview",
  play: "Play preview",
  project: "acme-billing",
  path: "~/Developer/acme-billing",
  newThread: "New Thread",
  search: "Search Threads",
  settings: "Settings",
  threads: [
    { title: "Add idempotency keys to refunds", status: "input", age: "now" },
    { title: "Upgrade Stripe SDK to v18", status: "approval", age: "4m" },
    { title: "Fix flaky currency rounding test", status: "done", age: "2h" },
    { title: "Review PR #142 with Codex", status: "idle", age: "3h" },
  ],
  title: "Retry failed invoice webhooks",
  branch: "feat/invoice-retries",
  diffstat: { added: 54, removed: 6 },
  prompt:
    "Retry failed invoice webhooks with exponential backoff. Keep the dispatcher's public API unchanged and add tests.",
  you: "You · 9:31 PM",
  composerEmpty: "Describe a task, or type / for commands",
  composerFollowUp: "Send a follow-up…",
  permission: "Auto-edit",
  working: "Working",
  activity: [
    { verb: "Read", target: "src/webhooks/dispatcher.ts" },
    { verb: "Read", target: "src/webhooks/client.ts" },
    { verb: "Edited", target: "src/webhooks/retry.ts", stat: "+23 −0" },
    { verb: "Edited", target: "src/webhooks/dispatcher.ts", stat: "+9 −6" },
    { verb: "Edited", target: "src/webhooks/retry.test.ts", stat: "+22 −0" },
    { verb: "Ran", target: "pnpm test", stat: "14 passed" },
  ],
  worked: {
    summary: "Explored 3 files · Edited 3 files · Ran 1 command",
    time: "Worked for 7m 00s",
  },
  answer:
    "Failed invoice webhooks now retry with exponential backoff and full jitter.",
  bullets: [
    {
      code: "src/webhooks/retry.ts",
      text: "(new): up to 5 attempts, capped at 30s. 4xx other than 429 is not retried.",
    },
    {
      code: "src/webhooks/dispatcher.ts",
      text: "uses deliverWithRetry and sends an Idempotency-Key header.",
    },
    {
      code: "src/webhooks/retry.test.ts",
      text: "(new): the backoff curve and the no-retry 4xx path.",
    },
  ],
  closing: {
    code: "pnpm test",
    text: "passes (14 tests). I did not run lint after the last edit.",
  },
  tabs: { thread: "Thread", code: "Code" },
  diff: {
    tab: "Diff",
    scopes: ["Turn", "Uncommitted", "Branch"],
    blind: "Blind review",
    empty: "No changes in this Turn yet",
    verification: "Verification",
    commands: [
      { command: "pnpm test", label: "Test" },
      { command: "pnpm lint", label: "Lint" },
      { command: "pnpm typecheck", label: "Type check" },
    ],
    fresh: "Fresh",
    stale: "Stale",
    never: "Never run",
    risk: "Risk signals",
    risks: [
      {
        text: "Touches a sensitive path: src/webhooks/**",
        file: "src/webhooks/dispatcher.ts",
      },
      {
        text: "SQL changed with no Verification command.",
        file: "migrations/0042_webhook_attempts.sql",
      },
    ],
    files: [
      {
        status: "M",
        name: "dispatcher.ts",
        dir: "src/webhooks/",
        stat: ["+9", "−6"],
      },
      {
        status: "A",
        name: "retry.ts",
        dir: "src/webhooks/",
        stat: ["+23", "−0"],
      },
      {
        status: "A",
        name: "retry.test.ts",
        dir: "src/webhooks/",
        stat: ["+22", "−0"],
      },
    ],
    revert: "Revert",
  },
  commit: "Commit & Push",
  pr: { number: "#143", open: "Open", merged: "Merged" },
} as const;

/**
 * The beats of the scene, in order, and how long each holds (ms). An element
 * of the preview appears at a beat (`--at`) and, if it is replaced, leaves
 * at a later one (`--until`); the last beat is the finished scene, which is
 * what the server renders and what reduced motion keeps.
 */
export const BEATS = {
  empty: 0,
  typing: 1,
  sent: 2,
  read1: 3,
  read2: 4,
  edit1: 5,
  edit2: 6,
  edit3: 7,
  ran: 8,
  answered: 9,
  risks: 10,
  pushed: 11,
  merged: 12,
} as const;

export const BEAT_MS = [
  900, 2600, 1000, 650, 600, 750, 750, 750, 1100, 2400, 1600, 1500, 3800,
] as const;

export const FINAL_BEAT = BEATS.merged;
