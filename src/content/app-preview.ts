// The interactive app preview (Design system, App preview; ADR-0004): a
// small, explorable copy of the Oxide workbench. Nothing plays by itself;
// the visitor switches Projects and Terminals, enters a command, browses the
// Files view, opens a file in the Code workspace, and inspects Issues and
// Pull request Surfaces. Marked `data-capture`, so the copy gates read it as
// they read a Capture's pixels.

export type CommandBlock = {
  id: string;
  command: string;
  duration: string;
  output: string[];
  exitCode: number;
};

export type PreviewTerminal = {
  id: string;
  name: string;
  shell: string;
  cwd: string;
  blocks: CommandBlock[];
};

export type PreviewProject = {
  id: string;
  name: string;
  path: string;
  terminals: PreviewTerminal[];
  files: { name: string; path: string; lines: string[] }[];
};

export type PreviewIssue = {
  number: string;
  title: string;
  author: string;
  age: string;
  labels: string[];
  body: string;
  comment: { author: string; text: string };
};

export const PREVIEW_PROJECTS: PreviewProject[] = [
  {
    id: "acme-billing",
    name: "acme-billing",
    path: "~/Developer/acme-billing",
    terminals: [
      {
        id: "claude",
        name: "claude",
        shell: "zsh",
        cwd: "~/Developer/acme-billing",
        blocks: [
          {
            id: "git-status",
            command: "git status -sb",
            duration: "500 ms",
            exitCode: 0,
            output: [
              "## feat/invoice-retries...origin/feat/invoice-retries",
              " M src/webhooks/dispatcher.ts",
              " A src/webhooks/retry.ts",
              " A src/webhooks/retry.test.ts",
            ],
          },
          {
            id: "pnpm-test",
            command: "pnpm test",
            duration: "2.00 s",
            exitCode: 0,
            output: [
              " ✓ src/webhooks/retry.test.ts (6 tests)",
              " ✓ src/webhooks/dispatcher.test.ts (8 tests)",
              " Test Files  2 passed (2) · Tests  14 passed (14)",
            ],
          },
          {
            id: "claude-review",
            command: 'claude -p "Review retry.ts for 429 Retry-After handling"',
            duration: "5.00 s",
            exitCode: 0,
            output: [
              "Checked src/webhooks/retry.ts: 429 responses currently fall back to exponential backoff.",
              "Consider reading the Retry-After header before sleeping.",
            ],
          },
        ],
      },
      {
        id: "dev-server",
        name: "dev server",
        shell: "zsh",
        cwd: "~/Developer/acme-billing",
        blocks: [
          {
            id: "pnpm-dev",
            command: "pnpm dev",
            duration: "1.20 s",
            exitCode: 0,
            output: [
              "Listening on http://127.0.0.1:4010",
              "Webhook worker ready (concurrency: 4)",
            ],
          },
        ],
      },
      {
        id: "tests",
        name: "tests",
        shell: "zsh",
        cwd: "~/Developer/acme-billing",
        blocks: [
          {
            id: "pnpm-watch",
            command: "pnpm test --watch",
            duration: "182 ms",
            exitCode: 0,
            output: [
              " WATCH  Waiting for file changes...",
              " ✓ 14 tests passed in 182ms",
            ],
          },
        ],
      },
    ],
    files: [
      {
        name: "retry.ts",
        path: "src/webhooks/retry.ts",
        lines: [
          "export async function deliverWithRetry(",
          "  send: () => Promise<Response>,",
          "  { attempts = 5, capMs = 30_000 } = {},",
          ") {",
          "  for (let i = 0; i < attempts; i++) {",
          "    const res = await send();",
          "    if (res.ok || !retryable(res.status)) return res;",
          "    await sleep(jitter(Math.min(capMs, 2 ** i * 500)));",
          "  }",
          '  throw new Error("webhook.retry_exhausted");',
          "}",
        ],
      },
      {
        name: "dispatcher.ts",
        path: "src/webhooks/dispatcher.ts",
        lines: [
          'import { deliverWithRetry } from "./retry";',
          "",
          "export async function dispatchInvoiceEvent(event: {",
          "  id: string;",
          "  url: string;",
          "  body: string;",
          "}) {",
          "  return deliverWithRetry(() =>",
          "    fetch(event.url, {",
          '      method: "POST",',
          '      headers: { "Idempotency-Key": event.id },',
          "      body: event.body,",
          "    }),",
          "  );",
          "}",
        ],
      },
    ],
  },
  {
    id: "oxide-docs",
    name: "oxide-docs",
    path: "~/Developer/oxide-docs",
    terminals: [
      {
        id: "zsh",
        name: "zsh",
        shell: "zsh",
        cwd: "~/Developer/oxide-docs",
        blocks: [
          {
            id: "docs-build",
            command: "pnpm build",
            duration: "3.40 s",
            exitCode: 0,
            output: ["✓ Static export ready in out/ (11 routes)"],
          },
        ],
      },
    ],
    files: [
      {
        name: "README.md",
        path: "README.md",
        lines: [
          "# Oxide Docs",
          "",
          "Open a Project, open as many clean terminals as you like.",
        ],
      },
    ],
  },
];

export const PREVIEW_ISSUES: PreviewIssue[] = [
  {
    number: "#139",
    title: "Invoice webhooks are lost when the endpoint is down",
    author: "lorenzo",
    age: "2d ago",
    labels: ["bug", "webhooks"],
    body: "When a customer endpoint returns 503 during a deploy, dispatchInvoiceEvent throws on the first failure.",
    comment: {
      author: "matteo",
      text: "Keep the Idempotency-Key stable across retries so receivers can deduplicate.",
    },
  },
  {
    number: "#137",
    title: "Refunds can be sent twice on timeout",
    author: "matteo",
    age: "4d ago",
    labels: ["reliability"],
    body: "Retries on timeout need a per-refund key so the upstream charge is never duplicated.",
    comment: {
      author: "lorenzo",
      text: "Derived from refund.id in createRefund.",
    },
  },
  {
    number: "#131",
    title: "Upgrade to Stripe API 2025-10",
    author: "lorenzo",
    age: "8d ago",
    labels: ["dependencies"],
    body: "Update SDK types and webhook signature verification.",
    comment: {
      author: "matteo",
      text: "Blocked until #139 lands.",
    },
  },
];

export const PREVIEW = {
  label: "Interactive preview of Oxide",
  hint: "Interactive preview: switch Projects and Terminals, run a command, open Files and Code, or inspect Issues and Pull request.",
  openProject: "Open a Project",
  settings: "Settings",
  backToTerminals: "Terminals",
  restored: "Restored session",
  commandPlaceholder: "Run a command in this terminal…",
  run: "Run",
  noShellReply: (command: string) =>
    `Preview only: no shell is attached. In Oxide, \`${command}\` runs in your own zsh, bash or PowerShell.`,
  surfaces: {
    issues: "Issues",
    pr: "Pull request",
  },
  pr: {
    number: "#143",
    title: "Retry failed invoice webhooks",
    branch: "feat/invoice-retries → main",
    stats: "+54 −6 in 3 files",
    checks: ["test (unit + integration)", "typecheck", "lint"],
    merge: "Squash and merge",
    merged: "Merged into main",
    note: "feat/invoice-retries will be deleted after merging.",
  },
} as const;
