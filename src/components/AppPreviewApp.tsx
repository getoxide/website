"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PREVIEW,
  PREVIEW_PROVIDERS,
  PREVIEW_THREADS,
  PREVIEW_TREE,
  type DiffLine,
  type PreviewFile,
  type PreviewProvider,
  type PreviewThread,
} from "@/content/app-preview";
import styles from "./AppPreview.module.css";

export type PreviewIcons = Record<
  | "repo"
  | "file-directory"
  | "bell"
  | "sidebar-expand"
  | "plus"
  | "search"
  | "chevron-down"
  | "chevron-right"
  | "git-branch"
  | "gear"
  | "git-commit"
  | "person"
  | "file-diff"
  | "file"
  | "terminal"
  | "git-pull-request"
  | "issue-opened"
  | "x"
  | "eye"
  | "shield-check"
  | "git-merge"
  | "arrow-up"
  | "paperclip"
  | "check"
  | "comment"
  | "alert",
  ReactNode
>;

type Surface = keyof typeof PREVIEW.surfaces;
type Scope = keyof typeof PREVIEW.scopes;
type PrState = "none" | "pushing" | "open" | "merged";
/** The visitor's answer to a question or an Approval, per Thread. */
type Resolution = { choice: string; done: boolean };

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

const KEYWORDS =
  /\b(export|async|function|const|let|return|await|if|for|throw|new|import|from|it|expect)\b/;

/** A small highlighter for the preview's TypeScript: words, strings, numbers. */
function highlight(line: string): ReactNode[] {
  return line
    .split(/("[^"]*"|`[^`]*`|\b\d[\d_]*\b|\b[a-z]+\b)/i)
    .map((part, i) => {
      if (!part) return null;
      if (/^["`]/.test(part))
        return (
          <span key={i} className={styles.tString}>
            {part}
          </span>
        );
      if (/^\d/.test(part))
        return (
          <span key={i} className={styles.tNumber}>
            {part}
          </span>
        );
      if (KEYWORDS.test(part) && part.match(KEYWORDS)![0] === part)
        return (
          <span key={i} className={styles.tKeyword}>
            {part}
          </span>
        );
      return part;
    });
}

function Hunk({ lines }: { lines: DiffLine[] }) {
  return (
    <div className={styles.hunk}>
      {lines.map(([sign, text], i) => (
        <div
          key={i}
          className={cx(
            styles.hunkLine,
            sign === "+" && styles.lineAdd,
            sign === "-" && styles.lineDel,
          )}
        >
          <span className={styles.sign}>{sign}</span>
          <code>{highlight(text)}</code>
        </div>
      ))}
    </div>
  );
}

/** The Provider's glyph: a neutral shape, never the vendor's logo. */
function Glyph({ provider }: { provider: PreviewProvider }) {
  return (
    <span className={cx(styles.glyph, styles[provider])} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16">
        {provider === "claude" ? (
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" />
          </g>
        ) : provider === "codex" ? (
          <path
            d="M8 1.2 14 4.6v6.8L8 14.8 2 11.4V4.6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        ) : (
          <path d="M8 1.5 14.5 14h-13z" fill="currentColor" />
        )}
      </svg>
    </span>
  );
}

const Mic = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      d="M8 1.5a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0V4A2.5 2.5 0 0 0 8 1.5ZM3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const STATUS_CLASS = {
  done: styles.statusDone,
  input: styles.statusInput,
  approval: styles.statusApproval,
  idle: styles.statusIdle,
};

/**
 * The interactive Oxide workbench (Design system, App preview). It starts on
 * the hero Capture's Thread, finished and ready to review, and never moves by
 * itself. Every control is a real button: switch Threads and Surfaces, open a
 * file's hunk or the Code workspace, answer the agent, allow or deny an
 * Approval, run a Blind review, Commit & Push, then Merge. The composer sends
 * a follow-up and says plainly that no agent is attached. The server renders
 * the starting state, so the page is complete without JavaScript.
 */
export function AppPreviewApp({
  provider,
  icons,
  className,
}: {
  provider: PreviewProvider;
  icons: PreviewIcons;
  className?: string;
}) {
  const p = PREVIEW;
  const { model, chip } = PREVIEW_PROVIDERS[provider];
  const reviewer =
    PREVIEW_PROVIDERS[provider === "codex" ? "claude" : "codex"].name;

  const [threadId, setThreadId] = useState(PREVIEW_THREADS[0].id);
  const [view, setView] = useState<"thread" | "code">("thread");
  const [codeFile, setCodeFile] = useState(PREVIEW_THREADS[0].files[1].path);
  const [surface, setSurface] = useState<Surface>("diff");
  const [scope, setScope] = useState<Scope>("turn");
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [reverted, setReverted] = useState<Record<string, boolean>>({});
  const [pr, setPr] = useState<Record<string, PrState>>(() =>
    Object.fromEntries(PREVIEW_THREADS.map((t) => [t.id, t.pr.initial])),
  );
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [followUps, setFollowUps] = useState<
    Record<string, { text: string; answered: boolean }[]>
  >({});
  const [draft, setDraft] = useState("");
  const [blind, setBlind] = useState<"idle" | "running" | "done">("idle");
  const [findings, setFindings] = useState<Record<number, string>>({});

  const timers = useRef<number[]>([]);
  const messages = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    // Hydrated: the controls answer from now on (the runtime boots after the
    // LCP paint, so a moment after the page shows).
    root.current?.setAttribute("data-ready", "");
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const scrollDown = () =>
    later(() => {
      const el = messages.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);

  const thread = PREVIEW_THREADS.find((t) => t.id === threadId)!;
  const resolution = resolved[thread.id];
  const files: PreviewFile[] = [
    ...thread.files,
    ...(resolution?.done && resolution.choice !== "deny"
      ? (thread.filesAfter ?? [])
      : []),
  ];
  const liveFiles = files.filter((f) => !reverted[f.path]);
  const added = liveFiles.reduce((n, f) => n + f.added, 0);
  const removed = liveFiles.reduce((n, f) => n + f.removed, 0);
  const prState = pr[thread.id];
  const status = (t: PreviewThread) =>
    resolved[t.id]?.done ? "done" : t.status;

  const selectThread = (id: string) => {
    setThreadId(id);
    setView("thread");
    setOpenFile(null);
    setStepsOpen(false);
    setScope("turn");
    setBlind("idle");
    setFindings({});
  };

  const resolve = (choice: string) => {
    const id = thread.id;
    setResolved((r) => ({ ...r, [id]: { choice, done: false } }));
    scrollDown();
    later(() => {
      setResolved((r) => ({ ...r, [id]: { choice, done: true } }));
      scrollDown();
    }, 1100);
  };

  const push = () => {
    const id = thread.id;
    setPr((s) => ({ ...s, [id]: "pushing" }));
    later(() => setPr((s) => ({ ...s, [id]: "open" })), 900);
  };

  const merge = () => setPr((s) => ({ ...s, [thread.id]: "merged" }));

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const id = thread.id;
    setDraft("");
    setFollowUps((f) => ({
      ...f,
      [id]: [...(f[id] ?? []), { text, answered: false }],
    }));
    scrollDown();
    later(() => {
      setFollowUps((f) => ({
        ...f,
        [id]: (f[id] ?? []).map((m) => ({ ...m, answered: true })),
      }));
      scrollDown();
    }, 1000);
  };

  const runBlind = () => {
    setBlind("running");
    later(() => setBlind("done"), 1400);
  };

  // A Thread waiting on the visitor has nothing to push until it resolves.
  const waiting = Boolean(thread.question || thread.approval);
  const canPush =
    liveFiles.length > 0 &&
    prState === "none" &&
    (!waiting || Boolean(resolution?.done));

  return (
    <figure
      ref={root}
      className={cx(styles.preview, className)}
      role="group"
      aria-label={p.label(provider)}
      data-capture=""
    >
      <div className={styles.window}>
        <div className={styles.titlebar} aria-hidden="true">
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.projectPill}>
            {icons.repo}
            {p.project}
          </span>
          <span className={styles.path}>
            {icons["file-directory"]}
            {p.path}
          </span>
          <span className={styles.titleIcons}>
            {icons.bell}
            {icons["file-directory"]}
            <span className={styles.iconOn}>{icons["sidebar-expand"]}</span>
          </span>
        </div>

        <div className={styles.body}>
          {/* Threads */}
          <div className={styles.sidebar}>
            <div className={styles.sideTop} aria-hidden="true">
              <span className={styles.newThread}>
                {icons.plus}
                {p.newThread}
              </span>
              <span className={styles.square}>{icons.repo}</span>
            </div>
            <div className={styles.search} aria-hidden="true">
              {icons.search}
              {p.search}
            </div>
            <div className={styles.group} aria-hidden="true">
              {icons["chevron-down"]}
              {icons.repo}
              {p.project}
            </div>
            <ul className={styles.threads}>
              {PREVIEW_THREADS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={cx(
                      styles.threadItem,
                      t.id === threadId && styles.threadActive,
                    )}
                    aria-current={t.id === threadId ? "true" : undefined}
                    onClick={() => selectThread(t.id)}
                  >
                    <span className={cx(styles.dot, STATUS_CLASS[status(t)])} />
                    <span className={styles.threadTitle}>{t.title}</span>
                    <span className={styles.age}>{t.age}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.settings} aria-hidden="true">
              {icons.gear}
              {p.settings}
            </div>
          </div>

          {/* The Thread, or the Code workspace */}
          <div className={styles.thread}>
            <div className={styles.tabs}>
              {(["thread", "code"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={cx(styles.tab, view === v && styles.tabOn)}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  {p.tabs[v]}
                </button>
              ))}
            </div>

            {view === "code" ? (
              <div className={styles.code}>
                <div className={styles.codeTabs}>
                  {icons.file}
                  <code>{codeFile}</code>
                </div>
                <div className={styles.editor} tabIndex={0}>
                  {(
                    PREVIEW_THREADS.flatMap((t) => [
                      ...t.files,
                      ...(t.filesAfter ?? []),
                    ]).find((f) => f.path === codeFile)?.hunk ?? []
                  )
                    .filter(([sign]) => sign !== "-")
                    .map(([, text], i) => (
                      <div key={i} className={styles.editorLine}>
                        <span className={styles.lineNo}>{i + 1}</span>
                        <code>{highlight(text)}</code>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.header}>
                  <span className={styles.avatar}>
                    <Glyph provider={provider} />
                  </span>
                  <div className={styles.headText}>
                    <div className={styles.title}>{thread.title}</div>
                    <div className={styles.headRow}>
                      <span className={styles.branch}>
                        {icons["git-branch"]}
                        {thread.branch}
                      </span>
                      {liveFiles.length ? (
                        <span className={styles.chip}>
                          <span className={styles.add}>+{added}</span>
                          <span className={styles.del}>−{removed}</span>
                        </span>
                      ) : null}
                      {prState === "none" && canPush ? (
                        <button
                          type="button"
                          className={styles.commit}
                          onClick={push}
                        >
                          {icons["git-commit"]}
                          {p.commit}
                        </button>
                      ) : null}
                      {prState === "pushing" ? (
                        <span className={cx(styles.commit, styles.busy)}>
                          {icons["git-commit"]}
                          {p.pushing}
                        </span>
                      ) : null}
                      {prState === "open" ? (
                        <>
                          <button
                            type="button"
                            className={cx(styles.pr, styles.prOpen)}
                            onClick={() => setSurface("pr")}
                          >
                            {icons["git-pull-request"]}
                            {thread.pr.number} · {p.open}
                          </button>
                          <button
                            type="button"
                            className={styles.mergeButton}
                            onClick={merge}
                          >
                            {icons["git-merge"]}
                            {p.merge}
                          </button>
                        </>
                      ) : null}
                      {prState === "merged" ? (
                        <button
                          type="button"
                          className={cx(styles.pr, styles.prMerged)}
                          onClick={() => setSurface("pr")}
                        >
                          {icons["git-merge"]}
                          {thread.pr.number} · {p.merged}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className={styles.messages} ref={messages} tabIndex={0}>
                  <div className={styles.user}>
                    <p className={styles.bubble}>{thread.prompt}</p>
                    <span className={styles.meta}>
                      {icons.person}
                      {p.you} · {thread.time}
                    </span>
                  </div>

                  <div className={styles.agent}>
                    <div className={styles.agentHead}>
                      <Glyph provider={provider} />
                      <span>{model}</span>
                    </div>

                    {thread.answer ? (
                      <div className={styles.indent}>
                        <button
                          type="button"
                          className={styles.worked}
                          aria-expanded={stepsOpen}
                          onClick={() => setStepsOpen((o) => !o)}
                        >
                          <span
                            className={cx(
                              styles.chevron,
                              stepsOpen && styles.chevronOpen,
                            )}
                          >
                            {icons["chevron-right"]}
                          </span>
                          <span>{thread.answer.worked}</span>
                          <span className={styles.workedTime}>
                            {thread.answer.time}
                          </span>
                        </button>
                        {stepsOpen ? (
                          <ul className={styles.steps}>
                            {thread.answer.steps.map((s) => (
                              <li key={s}>
                                <code>{s}</code>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <p className={styles.answer}>{thread.answer.text}</p>
                        {thread.answer.bullets ? (
                          <ul className={styles.bullets}>
                            {thread.answer.bullets.map((b) => (
                              <li key={b.code}>
                                <code>{b.code}</code> {b.text}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {thread.answer.closing ? (
                          <p className={styles.answer}>
                            {thread.answer.closing.code ? (
                              <code>{thread.answer.closing.code}</code>
                            ) : null}{" "}
                            {thread.answer.closing.text}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {thread.question ? (
                      <div className={styles.indent}>
                        <div className={cx(styles.card, styles.cardInput)}>
                          <span className={styles.cardLabel}>
                            {icons.comment}
                            {p.question}
                          </span>
                          <p>{thread.question.text}</p>
                          {resolution ? null : (
                            <div className={styles.options}>
                              {thread.question.options.map((o) => (
                                <button
                                  key={o}
                                  type="button"
                                  className={styles.option}
                                  onClick={() => resolve(o)}
                                >
                                  {o}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {thread.approval ? (
                      <div className={styles.indent}>
                        <div className={cx(styles.card, styles.cardApproval)}>
                          <span className={styles.cardLabel}>
                            {icons["shield-check"]}
                            {p.approval} · {thread.approval.reason}
                          </span>
                          <code className={styles.command}>
                            $ {thread.approval.command}
                          </code>
                          {resolution ? null : (
                            <div className={styles.options}>
                              <button
                                type="button"
                                className={cx(styles.option, styles.allow)}
                                onClick={() => resolve("allow")}
                              >
                                {icons.check}
                                {p.allow}
                              </button>
                              <button
                                type="button"
                                className={styles.option}
                                onClick={() => resolve("deny")}
                              >
                                {icons.x}
                                {p.deny}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {resolution && thread.question ? (
                    <div className={styles.user}>
                      <p className={styles.bubble}>{resolution.choice}</p>
                    </div>
                  ) : null}
                  {resolution ? (
                    <div className={cx(styles.agent, styles.indent)}>
                      {resolution.done ? (
                        <>
                          {thread.approval && resolution.choice === "allow" ? (
                            <code className={styles.command}>
                              {thread.approval.output}
                            </code>
                          ) : null}
                          <p className={styles.answer}>
                            {thread.question
                              ? thread.question.reply
                              : resolution.choice === "allow"
                                ? thread.approval!.allowed
                                : thread.approval!.denied}
                          </p>
                        </>
                      ) : (
                        <span className={styles.working}>{p.working}</span>
                      )}
                    </div>
                  ) : null}

                  {(followUps[thread.id] ?? []).map((m, i) => (
                    <div key={i} className={styles.followUp}>
                      <div className={styles.user}>
                        <p className={styles.bubble}>{m.text}</p>
                      </div>
                      <div className={cx(styles.agent, styles.indent)}>
                        {m.answered ? (
                          <p className={styles.answer}>
                            {p.followUpReply(provider)}
                          </p>
                        ) : (
                          <span className={styles.working}>{p.working}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  className={styles.composer}
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <label className={styles.inputWrap}>
                    <span className={styles.visuallyHidden}>{p.composer}</span>
                    <input
                      className={styles.input}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={p.composer}
                    />
                  </label>
                  <div className={styles.composerBar}>
                    <span className={styles.composerChip}>
                      <Glyph provider={provider} />
                      {chip}
                      {icons["chevron-down"]}
                    </span>
                    <span className={styles.composerChip}>
                      {icons["shield-check"]}
                      {p.permission}
                      {icons["chevron-down"]}
                    </span>
                    <span className={styles.composerIcons}>
                      <Mic />
                      {icons.paperclip}
                      <button
                        type="submit"
                        className={styles.send}
                        aria-label={p.send}
                      >
                        {icons["arrow-up"]}
                      </button>
                    </span>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* The Surfaces */}
          <div className={styles.diff}>
            <div className={styles.surfaceTabs}>
              {(Object.keys(p.surfaces) as Surface[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cx(
                    styles.surfaceTab,
                    surface === s && styles.surfaceOn,
                  )}
                  aria-pressed={surface === s}
                  aria-label={s === "diff" ? undefined : p.surfaces[s]}
                  onClick={() => setSurface(s)}
                >
                  {
                    icons[
                      (
                        {
                          diff: "file-diff",
                          files: "file",
                          terminal: "terminal",
                          pr: "git-pull-request",
                          issues: "issue-opened",
                        } as const
                      )[s]
                    ]
                  }
                  {s === "diff" ? p.surfaces.diff : null}
                </button>
              ))}
            </div>

            <div className={styles.surfaceBody} tabIndex={0}>
              {surface === "diff" ? (
                <>
                  <div className={styles.toolbar}>
                    <span className={styles.segmented}>
                      {(Object.keys(p.scopes) as Scope[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={cx(
                            styles.seg,
                            scope === s && styles.segOn,
                          )}
                          aria-pressed={scope === s}
                          onClick={() => setScope(s)}
                        >
                          {p.scopes[s]}
                        </button>
                      ))}
                    </span>
                    <button
                      type="button"
                      className={styles.blind}
                      onClick={runBlind}
                      disabled={blind === "running" || !liveFiles.length}
                    >
                      {icons.eye}
                      {p.blind.button}
                    </button>
                  </div>
                  <p className={styles.scopeNote}>{p.scopeNote[scope]}</p>

                  {blind !== "idle" && liveFiles.length ? (
                    <div className={styles.blindPanel} aria-live="polite">
                      {blind === "running" ? (
                        <span className={styles.working}>
                          {p.blind.running(reviewer)}
                        </span>
                      ) : (
                        <>
                          <div className={styles.dossierHead}>
                            {p.blind.done(reviewer)}
                          </div>
                          {p.blind.findings.map((f, i) => (
                            <div key={f.file} className={styles.finding}>
                              <code>{f.file}</code>
                              <span>{f.text}</span>
                              {findings[i] ? (
                                <span className={styles.muted}>
                                  {findings[i] === "keep"
                                    ? p.blind.kept
                                    : p.blind.dismissed}
                                </span>
                              ) : (
                                <span className={styles.options}>
                                  <button
                                    type="button"
                                    className={styles.small}
                                    onClick={() =>
                                      setFindings((f) => ({
                                        ...f,
                                        [i]: "keep",
                                      }))
                                    }
                                  >
                                    {p.blind.keep}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.small}
                                    onClick={() =>
                                      setFindings((f) => ({
                                        ...f,
                                        [i]: "dismiss",
                                      }))
                                    }
                                  >
                                    {p.blind.dismiss}
                                  </button>
                                </span>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ) : null}

                  <div className={styles.dossier}>
                    <div className={styles.dossierHead}>{p.verification}</div>
                    {thread.checks.map((c) => {
                      const state =
                        resolution?.done && c.state === "never"
                          ? "fresh"
                          : c.state;
                      return (
                        <div key={c.command} className={styles.check}>
                          <span className={cx(styles.badge, styles[state])}>
                            {p.states[state]}
                          </span>
                          <code>{c.command}</code>
                          <span className={styles.muted}>{c.label}</span>
                        </div>
                      );
                    })}
                    {thread.risks.length ? (
                      <>
                        <div className={styles.dossierHead}>{p.risk}</div>
                        {thread.risks.map((r) => (
                          <div key={r.file} className={styles.risk}>
                            <span>{r.text}</span>
                            <code>{r.file}</code>
                          </div>
                        ))}
                      </>
                    ) : null}
                  </div>

                  {files.length ? (
                    <ul className={styles.fileList}>
                      {files.map((f) => {
                        const name = f.path.split("/").pop()!;
                        const dir = f.path.slice(0, -name.length);
                        const isOpen = openFile === f.path;
                        const gone = reverted[f.path];
                        return (
                          <li key={f.path}>
                            <div
                              className={cx(styles.file, gone && styles.gone)}
                            >
                              <button
                                type="button"
                                className={styles.fileButton}
                                aria-expanded={isOpen}
                                onClick={() =>
                                  setOpenFile(isOpen ? null : f.path)
                                }
                              >
                                <span
                                  className={cx(
                                    styles.fileStatus,
                                    f.status === "A"
                                      ? styles.added
                                      : styles.modified,
                                  )}
                                >
                                  {f.status}
                                </span>
                                <code className={styles.fileName}>{name}</code>
                                <code className={styles.fileDir}>{dir}</code>
                                <span className={styles.add}>+{f.added}</span>
                                <span className={styles.del}>−{f.removed}</span>
                              </button>
                              <button
                                type="button"
                                className={styles.small}
                                onClick={() =>
                                  setReverted((r) => ({
                                    ...r,
                                    [f.path]: !r[f.path],
                                  }))
                                }
                              >
                                {gone ? p.undo : p.revert}
                              </button>
                            </div>
                            {isOpen && !gone ? <Hunk lines={f.hunk} /> : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className={styles.empty}>{p.noChanges}</p>
                  )}
                </>
              ) : null}

              {surface === "files" ? (
                <ul className={styles.tree}>
                  {PREVIEW_TREE.map(({ dir, files: names }) => (
                    <li key={dir}>
                      <span className={styles.treeDir}>
                        {icons["file-directory"]}
                        <code>{dir}</code>
                      </span>
                      <ul>
                        {names.map((n) => (
                          <li key={n}>
                            <button
                              type="button"
                              className={cx(
                                styles.treeFile,
                                view === "code" &&
                                  codeFile === dir + n &&
                                  styles.treeOn,
                              )}
                              onClick={() => {
                                setCodeFile(dir + n);
                                setView("code");
                              }}
                            >
                              {icons.file}
                              <code>{n}</code>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : null}

              {surface === "terminal" ? (
                <pre className={styles.terminal}>{p.terminal.join("\n")}</pre>
              ) : null}

              {surface === "pr" ? (
                <div className={styles.prPanel}>
                  {prState === "none" || prState === "pushing" ? (
                    <p className={styles.empty}>{p.prNone(thread.branch)}</p>
                  ) : (
                    <>
                      <div className={styles.prTitle}>
                        <span
                          className={cx(
                            styles.pr,
                            prState === "open"
                              ? styles.prOpen
                              : styles.prMerged,
                          )}
                        >
                          {prState === "open"
                            ? icons["git-pull-request"]
                            : icons["git-merge"]}
                          {thread.pr.number} ·{" "}
                          {prState === "open" ? p.open : p.merged}
                        </span>
                        <span>{thread.title}</span>
                      </div>
                      <span className={styles.prChecks}>
                        {icons.check}
                        {p.prChecks}
                      </span>
                      {prState === "open" ? (
                        <button
                          type="button"
                          className={styles.mergeButton}
                          onClick={merge}
                        >
                          {icons["git-merge"]}
                          {p.merge}
                        </button>
                      ) : (
                        <p className={styles.muted}>{p.prMergedNote}</p>
                      )}
                    </>
                  )}
                </div>
              ) : null}

              {surface === "issues" ? (
                <ul className={styles.issues}>
                  {p.issues.map((i) => (
                    <li key={i.number}>
                      <span className={styles.issueIcon}>
                        {icons["issue-opened"]}
                      </span>
                      <span>{i.title}</span>
                      <code className={styles.muted}>{i.number}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <figcaption className={styles.hint}>{p.hint}</figcaption>
    </figure>
  );
}
