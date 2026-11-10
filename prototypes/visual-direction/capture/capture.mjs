// Renders the real Oxide frontend (Vite dev server) with staged Tauri IPC and screenshots it.
// Usage: OXIDE_REVIEW_URL=http://127.0.0.1:1427 node capture.mjs <out.png>
import { pathToFileURL } from "node:url";
const PW = process.env.OXIDE_PLAYWRIGHT_MODULE;
const { chromium } = await import(PW ? pathToFileURL(PW).href : "playwright");
const out = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.addInitScript(() => {
  let cb = 0; const callbacks = new Map(); const missing = new Set(); window.__missing = missing;
  const ago = (min) => new Date(Date.now() - min * 60000).toISOString();
  const project = { id: 1, name: "acme-billing", path: "~/Developer/acme-billing", hidden: false, open: true, missing: false };
  const base = { projectId: 1, provider: "claude", model: "claude-sonnet-4-6", effort: "medium", permissionMode: "auto-edit", sessionLost: false, continuedFrom: null, continuedIn: null, branch: null, worktreePath: null, setupOutput: null, issueNumber: null };
  const threads = [
    { ...base, id: 1, title: "Retry failed invoice webhooks", status: "completed", branch: "feat/invoice-retries", createdAt: ago(48), updatedAt: ago(2) },
    { ...base, id: 2, title: "Add idempotency keys to /charges", status: "working", createdAt: ago(20), updatedAt: ago(0) },
    { ...base, id: 3, title: "Upgrade Stripe SDK to v18", status: "needs-input", provider: "codex", model: "gpt-5.1-codex", createdAt: ago(35), updatedAt: ago(4) },
    { ...base, id: 4, title: "Fix flaky currency rounding test", status: "completed", createdAt: ago(300), updatedAt: ago(120) },
    { ...base, id: 5, title: "Review PR #142 with Codex", status: "interrupted", provider: "codex", model: "gpt-5.1-codex", createdAt: ago(600), updatedAt: ago(200) },
  ];
  const settings = { shortcuts: { dictation: "Mod+Shift+R", newThread: "Mod+N", openProject: "Mod+Shift+N", modelPicker: "Mod+Shift+M", pullRequests: "Mod+Shift+P", issues: "Mod+Shift+I", terminal: "Mod+Shift+T", files: "Mod+Shift+F", diff: "Mod+Shift+D", previousThread: "Mod+ArrowUp", nextThread: "Mod+ArrowDown", closeThread: "Mod+Shift+W", toggleTools: "Mod+\\", toggleBoard: "Mod+B", openSettings: "Mod+," }, defaultProvider: "claude", confirmQuit: true, claudeCustomizations: { claudeMd: false, skills: false, plugins: false, mcpServers: false, hooks: false }, providers: { claude: { model: null, effort: null, permissionMode: "auto-edit" }, codex: { model: null, effort: null, permissionMode: "auto-edit" }, antigravity: { model: null, effort: null, permissionMode: "auto-edit" } } };
  const caps = { supportedPermissionModes: ["ask", "auto-edit", "full-access"], interactiveApprovals: true, supportsReasoning: true, nativeAttachmentKinds: ["image"], midThreadModelSwitch: true, reportsUsageLimits: false };
  const L = (kind, text) => ({ kind, text });
  const ctx = (t) => L("context", t), add = (t) => L("added", t), rem = (t) => L("removed", t);
  const files = [
    { path: "src/webhooks/dispatcher.ts", oldPath: null, status: "modified", added: 9, removed: 6, binary: false, hunks: [{ header: "@@ -12,14 +12,17 @@ export async function dispatchInvoiceEvent(", lines: [
      ctx("  const delivery = await buildDelivery(event);"), ctx("  const endpoint = await endpointFor(event.accountId);"), ctx(""),
      rem("  const response = await fetch(endpoint.url, {"), rem("    method: \"POST\","), rem("    body: JSON.stringify(delivery.payload),"), rem("  });"),
      add("  const result = await deliverWithRetry(delivery, (d) =>"), add("    fetch(endpoint.url, {"), add("      method: \"POST\","), add("      headers: { \"Idempotency-Key\": d.id },"), add("      body: JSON.stringify(d.payload),"), add("    }),"), add("  );"),
    ] }, { header: "@@ -31,7 +34,8 @@ export async function dispatchInvoiceEvent(", lines: [
      ctx(""), rem("  if (!response.ok) {"), rem("    await markFailed(delivery.id, response.status);"),
      add("  if (!result.ok) {"), add("    await markFailed(delivery.id, `gave up after ${result.attempts} attempts`);"), add("    metrics.increment(\"webhook.retry_exhausted\");"),
      ctx("  }"),
    ] }] },
    { path: "src/webhooks/retry.ts", oldPath: null, status: "added", added: 23, removed: 0, binary: false, hunks: [{ header: "@@ -0,0 +1,23 @@", lines: [
      add('import { sleep } from "../lib/sleep";'), add('import type { WebhookDelivery } from "./types";'), add(""),
      add("const MAX_ATTEMPTS = 5;"), add("const BASE_DELAY_MS = 500;"), add(""),
      add("/** Exponential backoff with full jitter, capped at 30s. */"),
      add("export function backoffDelay(attempt: number, random = Math.random): number {"),
      add("  const ceiling = Math.min(30_000, BASE_DELAY_MS * 2 ** attempt);"),
      add("  return Math.floor(random() * ceiling);"), add("}"), add(""),
      add("export async function deliverWithRetry("), add("  delivery: WebhookDelivery,"),
      add("  send: (d: WebhookDelivery) => Promise<Response>,"), add("): Promise<{ ok: boolean; attempts: number }> {"),
      add("  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {"),
      add("    const response = await send(delivery).catch(() => null);"),
      add("    if (response?.ok) return { ok: true, attempts: attempt + 1 };"),
      add("    if (response && response.status < 500 && response.status !== 429) break;"),
      add("    await sleep(backoffDelay(attempt));"), add("  }"),
      add("  return { ok: false, attempts: MAX_ATTEMPTS };"), add("}"),
    ] }] },
    { path: "src/webhooks/retry.test.ts", oldPath: null, status: "added", added: 22, removed: 0, binary: false, hunks: [{ header: "@@ -0,0 +1,22 @@", lines: [
      add('import { describe, expect, it, vi } from "vitest";'), add('import { backoffDelay, deliverWithRetry } from "./retry";'), add(""),
      add('describe("backoffDelay", () => {'), add('  it("grows exponentially and stays under the 30s cap", () => {'),
      add("    expect(backoffDelay(0, () => 1)).toBe(500);"), add("    expect(backoffDelay(3, () => 1)).toBe(4_000);"), add("    expect(backoffDelay(12, () => 1)).toBe(30_000);"), add("  });"), add("});"), add(""),
      add('describe("deliverWithRetry", () => {'), add('  it("retries 5xx responses until one succeeds", async () => {'),
      add("    const send = vi.fn()"), add("      .mockResolvedValueOnce(new Response(null, { status: 503 }))"), add("      .mockResolvedValueOnce(new Response(null, { status: 200 }));"),
      add("    const result = await deliverWithRetry(delivery, send);"), add("    expect(result).toEqual({ ok: true, attempts: 2 });"), add("  });"),
      add("});"),
    ] }] },
  ];
  const dossier = {
    commands: [
      { command: "pnpm test", kind: "test", state: "fresh", turnIndex: 0, outcome: "succeeded", exitCode: 0 },
      { command: "pnpm lint", kind: "lint", state: "stale", turnIndex: 0, outcome: "succeeded", exitCode: 0 },
      { command: "pnpm typecheck", kind: "typeCheck", state: "neverRun", turnIndex: null, outcome: null, exitCode: null },
    ],
    signals: [
      { kind: "sensitivePath", explanation: "Touches a sensitive path: src/webhooks/**.", files: ["src/webhooks/dispatcher.ts"], language: null, threshold: null },
      { kind: "uncheckedLanguage", explanation: "SQL changed with no Verification command.", files: ["migrations/0042_webhook_attempts.sql"], language: "SQL", threshold: null },
    ],
    intent: { issue: null, prompts: [] },
    claim: null,
    baseBranch: "main", coverageKnown: true, uncoveredCommits: [], pullRequestKnown: true, pullRequest: null,
    supervision: { approvalsGranted: 2, approvalsDenied: 0, permissionModes: [{ mode: "auto-edit", turns: 1 }] },
    blindReviews: [],
  };
  const item = (i, kind, content, category = null, command = { line: null, outcome: "unknown", exitCode: null }) => ({ id: i + 1, itemIndex: i, kind, content, parentItemIndex: null, category, command, createdAt: ago(10) });
  const turnFor = (t) => {
    if (t.id === 1) return [{ id: 1, turnIndex: 0, prompt: "Retry failed invoice webhooks with exponential backoff. Keep the dispatcher's public API unchanged and add tests.", model: "claude-sonnet-4-6", effort: "medium", permissionMode: "auto-edit",
      segments: [{ kind: "text", text: "Retry failed invoice webhooks with exponential backoff. Keep the dispatcher's public API unchanged and add tests." }],
      status: "completed", startedAt: ago(9), completedAt: ago(2), error: null, approvals: [], unknownEvents: [], items: [
        item(0, "reasoning", "I'll look at how the dispatcher sends webhooks today before adding retry logic."),
        item(1, "tool_call", "Read src/webhooks/dispatcher.ts\nexport async function dispatchInvoiceEvent(event: InvoiceEvent) {", "explore"),
        item(2, "tool_call", "Read src/webhooks/types.ts\nexport interface WebhookDelivery {", "explore"),
        item(3, "tool_call", "Grep \"markFailed\" in src/\nsrc/webhooks/dispatcher.ts:27", "explore"),
        item(4, "file_change", "src/webhooks/retry.ts", "edit"),
        item(5, "file_change", "src/webhooks/dispatcher.ts", "edit"),
        item(6, "file_change", "src/webhooks/retry.test.ts", "edit"),
        item(7, "tool_call", "Run pnpm test\n Test Files  3 passed (3)\n      Tests  14 passed (14)", "run", { line: "pnpm test", outcome: "succeeded", exitCode: 0 }),
        item(8, "agent_message", "Failed invoice webhooks now retry with exponential backoff and full jitter.\n\n- **`src/webhooks/retry.ts`** (new): `deliverWithRetry` makes up to 5 attempts, capped at 30s between tries. 4xx responses other than 429 are not retried.\n- **`src/webhooks/dispatcher.ts`**: uses `deliverWithRetry`, sends an `Idempotency-Key` header, and records `webhook.retry_exhausted` when it gives up.\n- **`src/webhooks/retry.test.ts`** (new): covers the backoff curve, a 5xx-then-success path and the no-retry 4xx path.\n\n`pnpm test` passes (14 tests). I did not run lint after the last edit."),
      ] }];
    if (t.id === 2) return [{ id: 2, turnIndex: 0, prompt: "Add idempotency keys to /charges", model: "claude-sonnet-4-6", effort: "medium", permissionMode: "auto-edit", segments: [{ kind: "text", text: "Add idempotency keys to /charges" }], status: "running", startedAt: ago(1), completedAt: null, error: null, approvals: [], unknownEvents: [], items: [item(0, "tool_call", "Read src/api/charges.ts", "explore")] }];
    if (t.id === 3) return [{ id: 3, turnIndex: 0, prompt: "Upgrade Stripe SDK to v18", model: "gpt-5.1-codex", effort: "medium", permissionMode: "ask", segments: [{ kind: "text", text: "Upgrade Stripe SDK to v18" }], status: "running", startedAt: ago(5), completedAt: null, error: null, unknownEvents: [], items: [],
      approvals: [{ id: 1, turnId: 3, approvalId: "a1", kind: "command", summary: "pnpm add stripe@18", options: [], decision: null, createdAt: ago(4), decidedAt: null }] }];
    return [{ id: t.id * 10, turnIndex: 0, prompt: t.title, model: t.model, effort: "medium", permissionMode: "auto-edit", segments: [{ kind: "text", text: t.title }], status: t.status === "interrupted" ? "interrupted" : "completed", startedAt: ago(130), completedAt: ago(120), error: null, approvals: [], unknownEvents: [], items: [item(0, "agent_message", "Done.")] }];
  };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: "main" }, currentWebview: { label: "main", windowLabel: "main" } },
    transformCallback(c) { const id = ++cb; callbacks.set(id, c); return id; },
    unregisterCallback(id) { callbacks.delete(id); },
    async invoke(command, args = {}) {
      if (command === "plugin:event|listen") return ++cb;
      if (command === "list_projects" || command === "rescan_projects") return [project];
      if (command === "last_selection") return { projectId: 1, threadId: 1 };
      if (command === "list_threads") return threads;
      if (command === "subscribe_thread") { const thread = threads.find((t) => t.id === args.threadId); return { thread, capabilities: { reasoningText: true, imageAttachments: true }, turnOffset: 0, turnCount: 1, lastSeq: 0, turns: turnFor(thread), supportedPermissionModes: caps.supportedPermissionModes }; }
      if (command === "get_settings") return { settings, errors: [], scanRoots: [] };
      if (command === "get_provider_capabilities" || command === "provider_capabilities") return caps;
      if (command === "detect_provider") return { available: true, installed: true, authenticated: true, version: "2.0", warning: null };
      if (command === "get_model_catalog") return [{ id: "claude-sonnet-4-6", name: "Sonnet 4.6", supportedEfforts: ["low", "medium", "high"] }, { id: "claude-opus-4-6", name: "Opus 4.6", supportedEfforts: ["low", "medium", "high"] }];
      if (command === "get_favourite_models") return [];
      if (command === "git_status") return { branch: "feat/invoice-retries", upstream: null, ahead: 0, behind: 0, added: 54, removed: 6, changedFiles: 3, pickerDisabledReason: null, protected: false, unpublished: false };
      if (command === "list_branches") return [{ name: "main", current: false }, { name: "feat/invoice-retries", current: true }];
      if (command === "git_diff") return { base: "main", files };
      if (command === "git_turn_diff") return { base: null, files };
      if (command === "list_turn_picks") return [{ turnIndex: 0, prompt: "Retry failed invoice webhooks with exponential backoff", checkpointed: true }];
      if (command === "verification_dossier" || command === "branch_dossier") return dossier;
      if (command === "get_project_verification_commands") return ["pnpm test", "pnpm lint"];
      if (command === "get_project_sensitive_paths") return ["src/webhooks/**"];
      if (command === "list_slash_commands") return [];
      if (command === "issues_state" || command === "pull_requests_state" || command === "github_state") return { availability: "ready", guidance: null };
      if (command === "fetch_project") return false;
      if (command === "list_dir") return [];
      if (["list_pull_requests", "list_issues", "language_tools", "find_files", "subscribe_board", "list_comments"].includes(command)) return [];
      missing.add(command); return null;
    },
  };
});
await page.goto(process.env.OXIDE_REVIEW_URL ?? "http://127.0.0.1:1427");
await page.locator(".thread-title").waitFor();
const toggle = page.getByRole("button", { name: "Toggle tools panel", exact: true });
if (await toggle.getAttribute("aria-pressed") !== "true") await toggle.click();
await page.getByRole("tab", { name: "Diff", exact: true }).click();
await page.locator(".dossier").waitFor();
await page.getByRole("tab", { name: "Turn", exact: true }).click();
await page.waitForTimeout(500);
if (process.env.OPEN_FILE) await page.locator(".diff-file-row").first().click().catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
console.log("missing IPC:", await page.evaluate(() => [...window.__missing]));
console.log("errors:", errors.slice(0, 5));
await page.screenshot({ path: out });
await browser.close();
