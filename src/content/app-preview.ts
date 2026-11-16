// The interactive app preview (Design system, App preview; ADR-0004): a
// small, explorable copy of the Oxide workbench. Nothing plays by itself;
// the visitor switches Threads, opens files, answers the agent, approves a
// command, runs a Blind review, pushes and merges. This is product UI, not
// site copy: the preview is marked `data-capture`, so the copy gates read it
// as they read a Capture's pixels. The main Thread is the hero Capture's.

export type PreviewProvider = "claude" | "codex" | "antigravity";

/** What changes with the Provider: its name, model line and composer chip. */
export const PREVIEW_PROVIDERS: Record<
  PreviewProvider,
  { name: string; model: string; chip: string }
> = {
  claude: {
    name: "Claude Code",
    model: "claude-sonnet-4-6 · medium",
    chip: "Sonnet 4.6 · Medium",
  },
  codex: {
    name: "Codex",
    model: "gpt-5-codex · medium",
    chip: "GPT-5 Codex · Medium",
  },
  antigravity: {
    name: "Antigravity CLI",
    model: "gemini-3-pro · high",
    chip: "Gemini 3 Pro · High",
  },
};

export type DiffLine = ["+" | "-" | " ", string];

export type PreviewFile = {
  status: "A" | "M";
  path: string;
  added: number;
  removed: number;
  hunk: DiffLine[];
};

export type PreviewCheck = {
  command: string;
  label: string;
  state: "fresh" | "stale" | "never";
};

export type ThreadStatus = "done" | "input" | "approval" | "idle";

type Answer = {
  worked: string;
  time: string;
  /** What the agent did, step by step, shown when the summary is opened. */
  steps: string[];
  text: string;
  bullets?: { code: string; text: string }[];
  closing?: { code?: string; text: string };
};

export type PreviewThread = {
  id: string;
  title: string;
  status: ThreadStatus;
  age: string;
  branch: string;
  prompt: string;
  time: string;
  /** A finished Turn: the agent's answer. */
  answer?: Answer;
  /** The agent stopped to ask: the visitor picks an option. */
  question?: { text: string; options: string[]; reply: string };
  /** The agent waits on an Approval: the visitor allows or denies it. */
  approval?: {
    command: string;
    reason: string;
    output: string;
    allowed: string;
    denied: string;
  };
  files: PreviewFile[];
  /** Files that land in the Diff once the question or Approval resolves. */
  filesAfter?: PreviewFile[];
  checks: PreviewCheck[];
  risks: { text: string; file: string }[];
  pr: { number: string; initial: "none" | "open" | "merged" };
};

const RETRY_HUNK: DiffLine[] = [
  ["+", "export async function deliverWithRetry("],
  ["+", "  send: () => Promise<Response>,"],
  ["+", "  { attempts = 5, capMs = 30_000 } = {},"],
  ["+", ") {"],
  ["+", "  for (let i = 0; i < attempts; i++) {"],
  ["+", "    const res = await send();"],
  ["+", "    if (res.ok || !retryable(res.status)) return res;"],
  ["+", "    await sleep(jitter(Math.min(capMs, 2 ** i * 500)));"],
  ["+", "  }"],
  ["+", '  throw new RetryExhausted("webhook.retry_exhausted");'],
  ["+", "}"],
];

const DISPATCH_HUNK: DiffLine[] = [
  [" ", "export async function dispatchInvoiceEvent(event) {"],
  ["-", "  const res = await post(event.url, event.body);"],
  ["-", "  if (!res.ok) throw new DeliveryFailed(res.status);"],
  ["+", "  const res = await deliverWithRetry(() =>"],
  ["+", "    post(event.url, event.body, {"],
  ["+", '      headers: { "Idempotency-Key": event.id },'],
  ["+", "    }),"],
  ["+", "  );"],
  [" ", "  return res;"],
  [" ", "}"],
];

const TEST_HUNK: DiffLine[] = [
  ["+", 'it("backs off up to 30s between tries", async () => {'],
  ["+", "  const waits = await run(failing(5));"],
  ["+", "  expect(waits.at(-1)).toBeLessThanOrEqual(30_000);"],
  ["+", "});"],
  ["+", ""],
  ["+", 'it("does not retry a 4xx other than 429", async () => {'],
  ["+", "  expect(await run(status(404))).toHaveLength(1);"],
  ["+", "});"],
];

export const PREVIEW_THREADS: PreviewThread[] = [
  {
    id: "webhooks",
    title: "Retry failed invoice webhooks",
    status: "done",
    age: "2m",
    branch: "feat/invoice-retries",
    prompt:
      "Retry failed invoice webhooks with exponential backoff. Keep the dispatcher's public API unchanged and add tests.",
    time: "9:31 PM",
    answer: {
      worked: "Explored 3 files · Edited 3 files · Ran 1 command",
      time: "Worked for 7m 00s",
      steps: [
        "Read src/webhooks/dispatcher.ts",
        "Read src/webhooks/client.ts",
        "Edited src/webhooks/retry.ts",
        "Edited src/webhooks/dispatcher.ts",
        "Edited src/webhooks/retry.test.ts",
        "Ran pnpm test · 14 passed",
      ],
      text: "Failed invoice webhooks now retry with exponential backoff and full jitter.",
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
    },
    files: [
      {
        status: "M",
        path: "src/webhooks/dispatcher.ts",
        added: 9,
        removed: 6,
        hunk: DISPATCH_HUNK,
      },
      {
        status: "A",
        path: "src/webhooks/retry.ts",
        added: 23,
        removed: 0,
        hunk: RETRY_HUNK,
      },
      {
        status: "A",
        path: "src/webhooks/retry.test.ts",
        added: 22,
        removed: 0,
        hunk: TEST_HUNK,
      },
    ],
    checks: [
      { command: "pnpm test", label: "Test", state: "fresh" },
      { command: "pnpm lint", label: "Lint", state: "stale" },
      { command: "pnpm typecheck", label: "Type check", state: "never" },
    ],
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
    pr: { number: "#143", initial: "none" },
  },
  {
    id: "refunds",
    title: "Add idempotency keys to refunds",
    status: "input",
    age: "now",
    branch: "feat/refund-keys",
    prompt:
      "Refunds can be sent twice when the API times out. Add idempotency keys.",
    time: "9:44 PM",
    question: {
      text: "Should a refund reuse its charge's idempotency key, or get a key of its own?",
      options: ["A key of its own", "Reuse the charge's key"],
      reply:
        "Done: each refund gets its own key, derived from the refund id, so a retried refund is never sent twice.",
    },
    files: [],
    filesAfter: [
      {
        status: "M",
        path: "src/refunds/create.ts",
        added: 6,
        removed: 1,
        hunk: [
          [" ", "export async function createRefund(refund) {"],
          ["-", "  return stripe.refunds.create(refund.params);"],
          ["+", "  return stripe.refunds.create(refund.params, {"],
          ["+", "    idempotencyKey: `refund_${refund.id}`,"],
          ["+", "  });"],
          [" ", "}"],
        ],
      },
    ],
    checks: [
      { command: "pnpm test", label: "Test", state: "never" },
      { command: "pnpm lint", label: "Lint", state: "never" },
    ],
    risks: [],
    pr: { number: "#144", initial: "none" },
  },
  {
    id: "stripe",
    title: "Upgrade Stripe SDK to v18",
    status: "approval",
    age: "4m",
    branch: "chore/stripe-18",
    prompt: "Upgrade the Stripe SDK to v18 and fix what breaks.",
    time: "9:27 PM",
    approval: {
      command: "pnpm add stripe@18.0.0",
      reason: "Installs a dependency",
      output: "+ stripe 18.0.0 (was 17.7.0)",
      allowed:
        "Upgraded to stripe 18.0.0. Two call sites used the removed `charges` API; both now use PaymentIntents.",
      denied: "Stopped before installing. stripe stays at 17.7.0.",
    },
    files: [],
    filesAfter: [
      {
        status: "M",
        path: "package.json",
        added: 1,
        removed: 1,
        hunk: [
          ["-", '    "stripe": "^17.7.0",'],
          ["+", '    "stripe": "^18.0.0",'],
        ],
      },
    ],
    checks: [{ command: "pnpm test", label: "Test", state: "never" }],
    risks: [],
    pr: { number: "#145", initial: "none" },
  },
  {
    id: "rounding",
    title: "Fix flaky currency rounding test",
    status: "done",
    age: "2h",
    branch: "fix/rounding",
    prompt: "The currency rounding test fails one run in ten. Find out why.",
    time: "7:12 PM",
    answer: {
      worked: "Explored 2 files · Edited 1 file · Ran 2 commands",
      time: "Worked for 3m 10s",
      steps: [
        "Read src/money/round.ts",
        "Read src/money/round.test.ts",
        "Edited src/money/round.test.ts",
        "Ran pnpm test --repeat 50 · 50 passed",
      ],
      text: "The test built random amounts with floats. It now uses integer cents, so the expected value is exact.",
    },
    files: [
      {
        status: "M",
        path: "src/money/round.test.ts",
        added: 2,
        removed: 2,
        hunk: [
          ["-", "const amount = Math.random() * 1000;"],
          ["+", "const cents = Math.floor(Math.random() * 100_000);"],
          ["-", "expect(round(amount)).toBe(Number(amount.toFixed(2)));"],
          ["+", "expect(round(cents / 100)).toBe(cents / 100);"],
        ],
      },
    ],
    checks: [
      { command: "pnpm test", label: "Test", state: "fresh" },
      { command: "pnpm lint", label: "Lint", state: "fresh" },
    ],
    risks: [],
    pr: { number: "#141", initial: "merged" },
  },
];

/** Files the Files Surface lists, and the code the Code workspace shows. */
export const PREVIEW_TREE: { dir: string; files: string[] }[] = [
  {
    dir: "src/webhooks/",
    files: ["dispatcher.ts", "retry.ts", "retry.test.ts"],
  },
  { dir: "src/refunds/", files: ["create.ts"] },
  { dir: "src/money/", files: ["round.test.ts"] },
];

export const PREVIEW = {
  label: (provider: PreviewProvider) =>
    `Interactive preview of Oxide with ${PREVIEW_PROVIDERS[provider].name}`,
  hint: "Interactive preview: switch Threads, open a file, run a Blind review, push and merge.",
  project: "acme-billing",
  path: "~/Developer/acme-billing",
  newThread: "New Thread",
  search: "Search Threads",
  settings: "Settings",
  tabs: { thread: "Thread", code: "Code" },
  you: "You",
  composer: "Send a follow-up…",
  send: "Send",
  permission: "Auto-edit",
  working: "Working",
  followUpReply: (provider: PreviewProvider) =>
    `This is a preview, so no agent is attached. In Oxide this prompt starts a new Turn with ${PREVIEW_PROVIDERS[provider].name}, and its diff lands here.`,
  question: "Needs your input",
  approval: "Approval",
  allow: "Allow",
  deny: "Deny",
  surfaces: {
    diff: "Diff",
    files: "Files",
    terminal: "Terminal",
    pr: "Pull request",
    issues: "Issues",
  },
  scopes: { turn: "Turn", uncommitted: "Uncommitted", branch: "Branch" },
  scopeNote: {
    turn: "What this Turn changed, between its two Checkpoints.",
    uncommitted:
      "May include concurrent changes from other Threads in this checkout.",
    branch: "Everything on the branch since it left main.",
  },
  blind: {
    button: "Blind review",
    running: (reviewer: string) =>
      `${reviewer} is reviewing the diff and the issue, not the conversation…`,
    done: (reviewer: string) => `${reviewer} found 2 things`,
    findings: [
      {
        file: "retry.ts:8",
        text: "A 429 with Retry-After should wait that long, not the backoff.",
      },
      {
        file: "dispatcher.ts:14",
        text: "The key reuses event.id; a replayed event keeps the same key, which is right. Worth a test.",
      },
    ],
    keep: "Keep",
    dismiss: "Dismiss",
    kept: "Kept as a Line comment",
    dismissed: "Dismissed",
  },
  verification: "Verification",
  states: { fresh: "Fresh", stale: "Stale", never: "Never run" },
  risk: "Risk signals",
  noChanges: "No changes in this Turn yet",
  revert: "Revert",
  reverted: "Reverted",
  undo: "Undo",
  commit: "Commit & Push",
  pushing: "Pushing…",
  merge: "Merge",
  open: "Open",
  merged: "Merged",
  prNone: (branch: string) =>
    `No pull request for ${branch} yet. Commit & Push, then open one here.`,
  prChecks: "3 checks passed",
  prMergedNote: "Merged into main. The branch is deleted.",
  terminal: [
    "$ pnpm test",
    "",
    " ✓ src/webhooks/retry.test.ts (6)",
    " ✓ src/webhooks/dispatcher.test.ts (8)",
    "",
    " Test Files  2 passed (2)",
    "      Tests  14 passed (14)",
  ],
  issues: [
    {
      number: "#139",
      title: "Invoice webhooks are lost when the endpoint is down",
    },
    { number: "#137", title: "Refunds can be sent twice on timeout" },
    { number: "#131", title: "Upgrade to Stripe API 2025-10" },
  ],
} as const;
