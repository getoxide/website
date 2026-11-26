"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PREVIEW,
  PREVIEW_ISSUES,
  PREVIEW_PROJECTS,
  type CommandBlock,
} from "@/content/app-preview";
import styles from "./AppPreview.module.css";

export type PreviewIcons = Record<
  | "repo"
  | "file-directory"
  | "sidebar-expand"
  | "plus"
  | "arrow-left"
  | "gear"
  | "terminal"
  | "file"
  | "issue-opened"
  | "git-pull-request"
  | "git-merge"
  | "x"
  | "check-circle-fill"
  | "screen-full"
  | "screen-normal"
  | "arrow-up",
  ReactNode
>;

type Surface = keyof typeof PREVIEW.surfaces;

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

const KEYWORDS =
  /\b(export|async|function|const|let|return|await|if|for|throw|new|import|from|interface)\b/;

function highlight(line: string): ReactNode[] {
  return line.split(/("[^"]*"|\b\d[\d_]*\b|\b[a-z]+\b)/i).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('"'))
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

/**
 * The interactive Oxide workbench (Design system, App preview; ADR-0004):
 * Open Projects and plain Terminals in the sidebar, Files view + split
 * Terminal | Code workspace in the centre, and Issues / Pull request Surfaces
 * in the right dock. Never moves by itself; server HTML is the starting state.
 */
export function AppPreviewApp({
  icons,
  className,
}: {
  icons: PreviewIcons;
  className?: string;
}) {
  const p = PREVIEW;
  const [projectId, setProjectId] = useState(PREVIEW_PROJECTS[0].id);
  const [terminalId, setTerminalId] = useState(
    PREVIEW_PROJECTS[0].terminals[0].id,
  );
  const [filesView, setFilesView] = useState(false);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [maximized, setMaximized] = useState<"terminal" | "code" | null>(null);
  const [surface, setSurface] = useState<Surface>("pr");
  const [toolsOpen, setToolsOpen] = useState(true);
  const [issueNum, setIssueNum] = useState<string | null>(
    PREVIEW_ISSUES[0].number,
  );
  const [prMerged, setPrMerged] = useState(false);
  const [draft, setDraft] = useState("");
  const [extraBlocks, setExtraBlocks] = useState<
    Record<string, CommandBlock[]>
  >({});

  const root = useRef<HTMLElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    root.current?.setAttribute("data-ready", "");
  }, []);

  const project =
    PREVIEW_PROJECTS.find((pr) => pr.id === projectId) ?? PREVIEW_PROJECTS[0];
  const terminal =
    project.terminals.find((t) => t.id === terminalId) ?? project.terminals[0];
  const blocks = [
    ...terminal.blocks,
    ...(extraBlocks[`${project.id}:${terminal.id}`] ?? []),
  ];
  const codeFile = openFile
    ? (project.files.find((f) => f.path === openFile) ?? null)
    : null;
  const activeIssue = issueNum
    ? (PREVIEW_ISSUES.find((i) => i.number === issueNum) ?? null)
    : null;

  const selectProject = (id: string) => {
    const next = PREVIEW_PROJECTS.find((pr) => pr.id === id)!;
    setProjectId(id);
    setTerminalId(next.terminals[0].id);
    setFilesView(false);
    setOpenFile(null);
    setMaximized(null);
  };

  const selectTerminal = (projId: string, termId: string) => {
    setProjectId(projId);
    setTerminalId(termId);
    setFilesView(false);
    if (maximized === "code") setMaximized(null);
  };

  const openFilesFor = (projId: string) => {
    const next = PREVIEW_PROJECTS.find((pr) => pr.id === projId)!;
    setProjectId(projId);
    setTerminalId(next.terminals[0].id);
    setFilesView(true);
  };

  const openCodeFile = (path: string) => {
    setOpenFile(path);
    if (maximized === "terminal") setMaximized(null);
  };

  const runCommand = () => {
    const cmd = draft.trim();
    if (!cmd) return;
    const key = `${project.id}:${terminal.id}`;
    setDraft("");
    setExtraBlocks((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] ?? []),
        {
          id: `custom-${Date.now()}`,
          command: cmd,
          duration: "0 ms",
          exitCode: 0,
          output: [p.noShellReply(cmd)],
        },
      ],
    }));
    window.setTimeout(() => {
      if (blocksRef.current) {
        blocksRef.current.scrollTop = blocksRef.current.scrollHeight;
      }
    }, 20);
  };

  const showTerminal = maximized !== "code";
  const showCode = Boolean(codeFile) && maximized !== "terminal";

  return (
    <figure
      ref={root}
      className={cx(styles.preview, className)}
      role="group"
      aria-label={p.label}
      data-capture=""
    >
      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.lights} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.projectPill}>
            {icons.repo}
            {project.name}
          </span>
          <span className={styles.path}>{project.path}</span>
          <button
            type="button"
            className={cx(styles.toolsToggle, toolsOpen && styles.iconOn)}
            aria-pressed={toolsOpen}
            aria-label="Toggle Tools panel"
            onClick={() => setToolsOpen((o) => !o)}
          >
            {icons["sidebar-expand"]}
          </button>
        </div>

        <div className={styles.body}>
          {/* Sidebar: Terminals view or Files view */}
          <div className={styles.sidebar}>
            {filesView ? (
              <div className={styles.filesView}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setFilesView(false)}
                >
                  {icons["arrow-left"]}
                  <span>{project.name}</span>
                  <span className={styles.muted}>· {p.backToTerminals}</span>
                </button>
                <ul className={styles.fileList}>
                  {project.files.map((f) => (
                    <li key={f.path}>
                      <button
                        type="button"
                        className={cx(
                          styles.fileRow,
                          openFile === f.path && styles.rowActive,
                        )}
                        onClick={() => openCodeFile(f.path)}
                      >
                        {icons.file}
                        <span>{f.path}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className={styles.sideTop} aria-hidden="true">
                  <span className={styles.openProjectBtn}>
                    {icons.repo}
                    {p.openProject}
                  </span>
                </div>
                <ul className={styles.projectList}>
                  {PREVIEW_PROJECTS.map((proj) => {
                    const active = proj.id === project.id;
                    return (
                      <li key={proj.id} className={styles.projectNode}>
                        <div
                          className={cx(
                            styles.projectRow,
                            active && styles.projectActive,
                          )}
                        >
                          <button
                            type="button"
                            className={styles.projectNameBtn}
                            onClick={() => selectProject(proj.id)}
                          >
                            {icons.repo}
                            <span>{proj.name}</span>
                          </button>
                          <button
                            type="button"
                            className={styles.rowIconBtn}
                            aria-label={`Files of ${proj.name}`}
                            onClick={() => openFilesFor(proj.id)}
                          >
                            {icons["file-directory"]}
                          </button>
                          <button
                            type="button"
                            className={styles.rowIconBtn}
                            aria-label={`New terminal in ${proj.name}`}
                            onClick={() =>
                              selectTerminal(proj.id, proj.terminals[0].id)
                            }
                          >
                            {icons.plus}
                          </button>
                        </div>
                        <ul className={styles.terminalList}>
                          {proj.terminals.map((term) => {
                            const isCurrent = active && term.id === terminal.id;
                            return (
                              <li key={term.id}>
                                <button
                                  type="button"
                                  className={cx(
                                    styles.terminalRow,
                                    isCurrent && styles.rowActive,
                                  )}
                                  aria-current={isCurrent ? "true" : undefined}
                                  onClick={() =>
                                    selectTerminal(proj.id, term.id)
                                  }
                                >
                                  {icons.terminal}
                                  <span>{term.name}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <div className={styles.settings} aria-hidden="true">
              {icons.gear}
              {p.settings}
            </div>
          </div>

          {/* Centre: Split Terminal | Code */}
          <div className={styles.centre}>
            {showTerminal ? (
              <div className={styles.terminalHalf}>
                <div className={styles.halfHeader}>
                  <span className={styles.halfTitle}>
                    {icons.terminal}
                    <span>{terminal.shell}</span>
                    <span className={styles.muted}>{terminal.cwd}</span>
                  </span>
                  {codeFile ? (
                    <button
                      type="button"
                      className={styles.halfAction}
                      aria-label={
                        maximized === "terminal"
                          ? "Restore split"
                          : "Maximize Terminal"
                      }
                      onClick={() =>
                        setMaximized((m) =>
                          m === "terminal" ? null : "terminal",
                        )
                      }
                    >
                      {maximized === "terminal"
                        ? icons["screen-normal"]
                        : icons["screen-full"]}
                    </button>
                  ) : null}
                </div>
                <div className={styles.blocks} ref={blocksRef} tabIndex={0}>
                  {blocks.map((b) => (
                    <div key={b.id} className={styles.block}>
                      <div className={styles.blockHead}>
                        <span className={styles.promptMark}>$</span>
                        <code className={styles.blockCmd}>{b.command}</code>
                        <span className={styles.blockMeta}>{b.duration}</span>
                      </div>
                      <pre className={styles.blockOut}>
                        {b.output.join("\n")}
                      </pre>
                    </div>
                  ))}
                  <div className={styles.restoredLine}>
                    <span>{p.restored}</span>
                  </div>
                </div>
                <form
                  className={styles.termInputWrap}
                  onSubmit={(e) => {
                    e.preventDefault();
                    runCommand();
                  }}
                >
                  <span className={styles.promptMark}>$</span>
                  <label className={styles.inputLabel}>
                    <span className={styles.visuallyHidden}>
                      {p.commandPlaceholder}
                    </span>
                    <input
                      className={styles.termInput}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={p.commandPlaceholder}
                    />
                  </label>
                  <button
                    type="submit"
                    className={styles.runBtn}
                    aria-label={p.run}
                  >
                    {icons["arrow-up"]}
                  </button>
                </form>
              </div>
            ) : null}

            {showCode && codeFile ? (
              <div className={styles.codeHalf}>
                <div className={styles.halfHeader}>
                  <span className={styles.halfTitle}>
                    {icons.file}
                    <code>{codeFile.name}</code>
                  </span>
                  <span className={styles.codeActions}>
                    <button
                      type="button"
                      className={styles.halfAction}
                      aria-label={
                        maximized === "code" ? "Restore split" : "Maximize Code"
                      }
                      onClick={() =>
                        setMaximized((m) => (m === "code" ? null : "code"))
                      }
                    >
                      {maximized === "code"
                        ? icons["screen-normal"]
                        : icons["screen-full"]}
                    </button>
                    <button
                      type="button"
                      className={styles.halfAction}
                      aria-label="Close file"
                      onClick={() => {
                        setOpenFile(null);
                        setMaximized(null);
                      }}
                    >
                      {icons.x}
                    </button>
                  </span>
                </div>
                <div className={styles.editor} tabIndex={0}>
                  {codeFile.lines.map((line, i) => (
                    <div key={i} className={styles.editorLine}>
                      <span className={styles.lineNo}>{i + 1}</span>
                      <code>{highlight(line)}</code>
                    </div>
                  ))}
                </div>
                <div className={styles.codeStatus}>
                  <span>0 errors · 0 warnings</span>
                  <span>TypeScript · LSP</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right dock: Issues and Pull request Surfaces */}
          {toolsOpen ? (
            <div className={styles.tools}>
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
                    onClick={() => setSurface(s)}
                  >
                    {s === "issues"
                      ? icons["issue-opened"]
                      : icons["git-pull-request"]}
                    {p.surfaces[s]}
                  </button>
                ))}
              </div>
              <div className={styles.surfaceBody} tabIndex={0}>
                {surface === "issues" ? (
                  activeIssue ? (
                    <div className={styles.detail}>
                      <button
                        type="button"
                        className={styles.surfaceBack}
                        onClick={() => setIssueNum(null)}
                      >
                        {icons["arrow-left"]}
                        Issues
                      </button>
                      <div className={styles.detailTitle}>
                        {activeIssue.title}{" "}
                        <span className={styles.muted}>
                          {activeIssue.number}
                        </span>
                      </div>
                      <div className={styles.badges}>
                        <span className={styles.badgeOpen}>Open</span>
                        {activeIssue.labels.map((l) => (
                          <span key={l} className={styles.labelChip}>
                            {l}
                          </span>
                        ))}
                      </div>
                      <p className={styles.bodyText}>{activeIssue.body}</p>
                      <div className={styles.commentBox}>
                        <strong>{activeIssue.comment.author}</strong>
                        <p>{activeIssue.comment.text}</p>
                      </div>
                    </div>
                  ) : (
                    <ul className={styles.itemList}>
                      {PREVIEW_ISSUES.map((issue) => (
                        <li key={issue.number}>
                          <button
                            type="button"
                            className={styles.itemRow}
                            onClick={() => setIssueNum(issue.number)}
                          >
                            <span className={styles.muted}>{issue.number}</span>
                            <span>{issue.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <div className={styles.detail}>
                    <div className={styles.detailTitle}>
                      {p.pr.title}{" "}
                      <span className={styles.muted}>{p.pr.number}</span>
                    </div>
                    <div className={styles.badges}>
                      <span
                        className={
                          prMerged ? styles.badgeMerged : styles.badgeOpen
                        }
                      >
                        {prMerged
                          ? icons["git-merge"]
                          : icons["git-pull-request"]}
                        {prMerged ? "Merged" : "Open"}
                      </span>
                      <code className={styles.branchChip}>{p.pr.branch}</code>
                    </div>
                    <div className={styles.checksCard}>
                      <div className={styles.checksHead}>Checks · 3 passed</div>
                      {p.pr.checks.map((c) => (
                        <div key={c} className={styles.checkRow}>
                          <span className={styles.checkIcon}>
                            {icons["check-circle-fill"]}
                          </span>
                          <span>{c}</span>
                          <span className={styles.checkPass}>Passed</span>
                        </div>
                      ))}
                    </div>
                    {prMerged ? (
                      <p className={styles.mergedNote}>{p.pr.merged}</p>
                    ) : (
                      <div className={styles.mergeWrap}>
                        <button
                          type="button"
                          className={styles.mergeBtn}
                          onClick={() => setPrMerged(true)}
                        >
                          {icons["git-merge"]}
                          {p.pr.merge}
                        </button>
                        <p className={styles.muted}>{p.pr.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <figcaption className={styles.caption}>{p.hint}</figcaption>
    </figure>
  );
}
