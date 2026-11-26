// The interactive app preview (Design system, App preview; ADR-0004): a
// faithful, explorable copy of the Oxide workbench. Nothing plays by itself;
// the visitor switches Projects and Terminals, opens the Project palette,
// enters a command, browses the Files view folder tree, opens a file in the
// Code workspace, and inspects Issues and Pull request Surfaces. Marked
// `data-capture`, so the copy gates read it as they read a Capture's pixels.

export type CommandBlock = {
  id: string;
  command: string;
  duration: string;
  output: { text: string; tone?: "ok" | "dim" }[];
  exitCode: number;
};

export type PreviewTerminal = {
  id: string;
  name: string;
  shell: string;
  cwd: string;
  blocks: CommandBlock[];
};

export type PreviewFile = {
  name: string;
  path: string;
  language: string;
  lines: string[];
};

export type PreviewProject = {
  id: string;
  name: string;
  path: string;
  terminals: PreviewTerminal[];
  files: PreviewFile[];
};

export type PreviewIssue = {
  number: string;
  title: string;
  state: "open" | "closed";
  author: string;
  age: string;
  labels: { name: string; tone: "red" | "blue" | "purple" }[];
  bullets: string[];
  bodyLead: string;
  reactions: number;
  subIssues: { number: string; title: string; done: boolean }[];
  assignee: string;
};

export type PreviewPullRequest = {
  number: string;
  title: string;
  state: "open" | "merged";
  author: string;
  age: string;
  head: string;
  base: string;
  statsAdd: string;
  statsDel: string;
  statsFiles: string;
  description: string;
  checks: { name: string; status: "passed"; optional?: boolean }[];
  reviewer: string;
};

export const PREVIEW_PROJECTS: PreviewProject[] = [
  {
    id: "acme-billing",
    name: "acme-billing",
    path: "/Users/lorenzo/Developer/acme-billing",
    terminals: [
      {
        id: "claude",
        name: "claude",
        shell: "zsh",
        cwd: "/Users/lorenzo/Developer/acme-billing",
        blocks: [
          {
            id: "git-checkout",
            command: "git checkout -b feat/invoice-retries",
            duration: "300 ms",
            exitCode: 0,
            output: [
              { text: "Switched to a new branch 'feat/invoice-retries'" },
            ],
          },
          {
            id: "git-status",
            command: "git status -sb",
            duration: "500 ms",
            exitCode: 0,
            output: [
              { text: "## feat/invoice-retries...origin/feat/invoice-retries" },
              { text: " M src/webhooks/dispatcher.ts" },
              { text: " A src/webhooks/retry.ts" },
              { text: " A src/webhooks/retry.test.ts" },
            ],
          },
          {
            id: "pnpm-lint",
            command: "pnpm typecheck && pnpm lint",
            duration: "1.20 s",
            exitCode: 0,
            output: [{ text: "✓ lint: 0 warnings, 0 errors", tone: "ok" }],
          },
          {
            id: "pnpm-test",
            command: "pnpm test",
            duration: "2.00 s",
            exitCode: 0,
            output: [
              { text: "✓ src/webhooks/retry.test.ts (6 tests)", tone: "ok" },
              {
                text: "✓ src/webhooks/dispatcher.test.ts (8 tests)",
                tone: "ok",
              },
              { text: "  Test Files  2 passed (2)", tone: "dim" },
              { text: "       Tests  14 passed (14)", tone: "dim" },
            ],
          },
          {
            id: "claude-review",
            command: 'claude -p "Review retry.ts for 429 Retry-After handling"',
            duration: "5.00 s",
            exitCode: 0,
            output: [
              {
                text: "Checked src/webhooks/retry.ts: 429 responses currently fall back to exponential backoff.",
              },
              {
                text: "Consider reading the Retry-After header before sleeping.",
              },
            ],
          },
        ],
      },
      {
        id: "dev-server",
        name: "dev server",
        shell: "zsh",
        cwd: "/Users/lorenzo/Developer/acme-billing",
        blocks: [
          {
            id: "pnpm-env",
            command: "pnpm db:migrate",
            duration: "420 ms",
            exitCode: 0,
            output: [{ text: "✓ 3 migrations up to date", tone: "ok" }],
          },
          {
            id: "pnpm-dev",
            command: "pnpm dev",
            duration: "1.20 s",
            exitCode: 0,
            output: [
              { text: "Listening on http://127.0.0.1:4010" },
              { text: "Webhook worker ready (concurrency: 4)", tone: "dim" },
            ],
          },
        ],
      },
      {
        id: "tests",
        name: "tests",
        shell: "zsh",
        cwd: "/Users/lorenzo/Developer/acme-billing",
        blocks: [
          {
            id: "pnpm-watch",
            command: "pnpm test --watch",
            duration: "182 ms",
            exitCode: 0,
            output: [
              { text: " WATCH  Waiting for file changes...", tone: "dim" },
              { text: " ✓ 14 tests passed in 182ms", tone: "ok" },
            ],
          },
        ],
      },
    ],
    files: [
      {
        name: "retry.ts",
        path: "src/webhooks/retry.ts",
        language: "TypeScript",
        lines: [
          "export interface RetryOptions {",
          "  attempts?: number;",
          "  capMs?: number;",
          "}",
          "",
          "function retryable(status: number): boolean {",
          "  return status === 429 || status >= 500;",
          "}",
          "",
          "export async function deliverWithRetry(",
          "  send: () => Promise<Response>,",
          "  { attempts = 5, capMs = 30_000 }: RetryOptions = {},",
          "): Promise<Response> {",
          "  for (let i = 0; i < attempts; i++) {",
          "    const res = await send();",
          "    if (res.ok || !retryable(res.status)) return res;",
          "    const base = Math.min(capMs, 2 ** i * 500);",
          "    await new Promise((r) => setTimeout(r, Math.random() * base));",
          "  }",
          '  throw new Error("webhook.retry_exhausted");',
          "}",
        ],
      },
      {
        name: "dispatcher.ts",
        path: "src/webhooks/dispatcher.ts",
        language: "TypeScript",
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
      {
        name: "retry.test.ts",
        path: "src/webhooks/retry.test.ts",
        language: "TypeScript",
        lines: [
          'import { describe, expect, it } from "vitest";',
          'import { deliverWithRetry } from "./retry";',
          "",
          'describe("deliverWithRetry", () => {',
          '  it("retries 503 responses and succeeds", async () => {',
          "    let calls = 0;",
          "    const res = await deliverWithRetry(async () => {",
          "      calls += 1;",
          "      return new Response(null, { status: calls < 2 ? 503 : 200 });",
          "    });",
          "    expect(res.status).toBe(200);",
          "  });",
          "});",
        ],
      },
      {
        name: "index.ts",
        path: "src/refunds/index.ts",
        language: "TypeScript",
        lines: [
          "export function refundKey(refundId: string): string {",
          "  return `refund:${refundId}`;",
          "}",
        ],
      },
      {
        name: "package.json",
        path: "package.json",
        language: "JSON",
        lines: [
          "{",
          '  "name": "acme-billing",',
          '  "private": true,',
          '  "scripts": {',
          '    "dev": "tsx watch src/server.ts",',
          '    "test": "vitest run"',
          "  }",
          "}",
        ],
      },
    ],
  },
  {
    id: "oxide-docs",
    name: "oxide-docs",
    path: "/Users/lorenzo/Developer/oxide-docs",
    terminals: [
      {
        id: "zsh",
        name: "zsh",
        shell: "zsh",
        cwd: "/Users/lorenzo/Developer/oxide-docs",
        blocks: [
          {
            id: "docs-check",
            command: "pnpm check:copy",
            duration: "240 ms",
            exitCode: 0,
            output: [{ text: "✓ Copy check: 15 pages clean", tone: "ok" }],
          },
          {
            id: "docs-build",
            command: "pnpm build",
            duration: "3.40 s",
            exitCode: 0,
            output: [
              { text: "✓ Static export ready in out/ (15 routes)", tone: "ok" },
            ],
          },
        ],
      },
    ],
    files: [
      {
        name: "README.md",
        path: "README.md",
        language: "Markdown",
        lines: [
          "# Oxide Docs",
          "",
          "Open a Project, open as many clean terminals as you like.",
        ],
      },
    ],
  },
];

export const PALETTE_PROJECTS = [
  {
    id: "acme-billing",
    name: "acme-billing",
    path: "~/Developer/acme-billing",
    open: true,
  },
  {
    id: "oxide-docs",
    name: "oxide-docs",
    path: "~/Developer/oxide-docs",
    open: true,
  },
  {
    id: "api-gateway",
    name: "api-gateway",
    path: "~/Developer/api-gateway",
    open: false,
  },
  {
    id: "design-tokens",
    name: "design-tokens",
    path: "~/Developer/design-tokens",
    open: false,
  },
] as const;

export const PREVIEW_ISSUES: PreviewIssue[] = [
  {
    number: "#139",
    title: "Invoice webhooks are lost when the endpoint is down",
    state: "open",
    author: "lorenzo",
    age: "2d ago",
    labels: [
      { name: "bug", tone: "red" },
      { name: "webhooks", tone: "blue" },
    ],
    bodyLead:
      "When a customer endpoint returns 503 during a deploy, dispatchInvoiceEvent throws on the first failure.",
    bullets: [
      "Retry 429 and 5xx with exponential backoff + jitter",
      "Never retry 4xx other than 429",
      "Send Idempotency-Key on every attempt",
    ],
    reactions: 1,
    subIssues: [
      { number: "#140", title: "Add exponential backoff helper", done: true },
      {
        number: "#141",
        title: "Respect Retry-After header on 429",
        done: false,
      },
    ],
    assignee: "lorenzo",
  },
  {
    number: "#137",
    title: "Refunds can be sent twice on timeout",
    state: "open",
    author: "matteo",
    age: "4d ago",
    labels: [{ name: "webhooks", tone: "blue" }],
    bodyLead:
      "Retries on timeout need a per-refund key so the upstream charge is never duplicated.",
    bullets: ["Derive key from refund.id in createRefund"],
    reactions: 2,
    subIssues: [],
    assignee: "matteo",
  },
  {
    number: "#131",
    title: "Upgrade to Stripe API 2025-10",
    state: "closed",
    author: "lorenzo",
    age: "8d ago",
    labels: [{ name: "dependencies", tone: "purple" }],
    bodyLead: "Update SDK types and webhook signature verification.",
    bullets: ["Bump stripe SDK", "Verify webhook signature tolerance"],
    reactions: 0,
    subIssues: [],
    assignee: "lorenzo",
  },
];

export const PREVIEW_PRS: PreviewPullRequest[] = [
  {
    number: "#143",
    title: "Retry failed invoice webhooks",
    state: "open",
    author: "lorenzo",
    age: "8h ago",
    head: "feat/invoice-retries",
    base: "main",
    statsAdd: "+54",
    statsDel: "-6",
    statsFiles: "in 3 files",
    description:
      "Adds deliverWithRetry with jittered backoff for 429 and 5xx responses while keeping Idempotency-Key stable.",
    checks: [
      { name: "test (unit + integration)", status: "passed" },
      { name: "typecheck", status: "passed" },
      { name: "lint", status: "passed", optional: true },
    ],
    reviewer: "matteo",
  },
  {
    number: "#142",
    title: "Tighten webhook signature check",
    state: "open",
    author: "matteo",
    age: "1d ago",
    head: "fix/webhook-sig",
    base: "main",
    statsAdd: "+18",
    statsDel: "-4",
    statsFiles: "in 2 files",
    description:
      "Reject signatures older than 300 seconds before parsing JSON.",
    checks: [
      { name: "test (unit + integration)", status: "passed" },
      { name: "typecheck", status: "passed" },
    ],
    reviewer: "lorenzo",
  },
];

export const PREVIEW = {
  label: "Interactive preview of Oxide",
  hint: "Interactive preview: switch Projects and Terminals, run a command, open Files and Code, or inspect Issues and Pull request.",
  openProject: "Open a Project",
  paletteHeader: "SEARCH PROJECTS, OR ADD ONE",
  palettePlaceholder: "Project name",
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
    back: "Pull requests",
    merge: "Squash and merge",
    close: "Close",
    merged: "Merged into main",
    ready: "Ready to merge",
    noConflicts: "No conflicts with the base branch",
    allChecksPassed: "All checks passed",
    note: "feat/invoice-retries will be deleted after merging.",
  },
  issue: {
    back: "Issues",
    close: "Close as completed",
    reopen: "Reopen issue",
  },
} as const;
