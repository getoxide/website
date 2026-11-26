"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PALETTE_PROJECTS,
  PREVIEW,
  PREVIEW_ISSUES,
  PREVIEW_PROJECTS,
  PREVIEW_PRS,
  type CommandBlock,
  type PreviewFile,
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
  | "issue-closed"
  | "git-pull-request"
  | "git-merge"
  | "x"
  | "check-circle-fill"
  | "check"
  | "screen-full"
  | "screen-normal"
  | "chevron-down"
  | "chevron-right"
  | "link"
  | "mark-github"
  | "alert"
  | "thumbsup"
  | "search"
  | "checklist"
  | "people"
  | "tag",
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

type TreeFolder = {
  name: string;
  folders: TreeFolder[];
  files: PreviewFile[];
};

function buildTree(files: PreviewFile[]): TreeFolder {
  const root: TreeFolder = { name: "", folders: [], files: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      let next = cur.folders.find((f) => f.name === seg);
      if (!next) {
        next = { name: seg, folders: [], files: [] };
        cur.folders.push(next);
      }
      cur = next;
    }
    cur.files.push(file);
  }
  return root;
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
  const [extraTerminals, setExtraTerminals] = useState<
    Record<string, { id: string; name: string; shell: string; cwd: string }[]>
  >({});
  const [filesView, setFilesView] = useState(false);
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>(
    {},
  );
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [maximized, setMaximized] = useState<"terminal" | "code" | null>(null);
  const [surface, setSurface] = useState<Surface>("pr");
  const [toolsOpen, setToolsOpen] = useState(true);
  const [issueNum, setIssueNum] = useState<string | null>(
    PREVIEW_ISSUES[0].number,
  );
  const [closedIssues, setClosedIssues] = useState<Record<string, boolean>>({});
  const [prNum, setPrNum] = useState<string | null>(PREVIEW_PRS[0].number);
  const [prMerged, setPrMerged] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
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
  const allTerminals = [
    ...project.terminals,
    ...(extraTerminals[project.id] ?? []).map((t) => ({ ...t, blocks: [] })),
  ];
  const terminal =
    allTerminals.find((t) => t.id === terminalId) ?? allTerminals[0];
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
  const activePr = prNum
    ? (PREVIEW_PRS.find((r) => r.number === prNum) ?? null)
    : null;

  const selectProject = (id: string) => {
    const next =
      PREVIEW_PROJECTS.find((pr) => pr.id === id) ?? PREVIEW_PROJECTS[0];
    setProjectId(next.id);
    setTerminalId(next.terminals[0].id);
    setFilesView(false);
    setOpenFile(null);
    setMaximized(null);
    setPaletteOpen(false);
  };

  const selectTerminal = (projId: string, termId: string) => {
    setProjectId(projId);
    setTerminalId(termId);
    setFilesView(false);
    if (maximized === "code") setMaximized(null);
  };

  const spawnTerminal = (projId: string) => {
    const proj = PREVIEW_PROJECTS.find((pr) => pr.id === projId);
    if (!proj) return;
    const count =
      proj.terminals.length + (extraTerminals[projId]?.length ?? 0) + 1;
    const newId = `zsh-${count}`;
    setExtraTerminals((prev) => ({
      ...prev,
      [projId]: [
        ...(prev[projId] ?? []),
        { id: newId, name: "zsh", shell: "zsh", cwd: proj.path },
      ],
    }));
    setProjectId(projId);
    setTerminalId(newId);
    setFilesView(false);
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

  const toggleDir = (dirPath: string) => {
    setCollapsedDirs((prev) => ({ ...prev, [dirPath]: !prev[dirPath] }));
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
          output: [{ text: p.noShellReply(cmd), tone: "dim" }],
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
  const tree = buildTree(project.files);

  const renderTree = (folder: TreeFolder, prefix = "", depth = 0) => {
    return (
      <>
        {folder.folders.map((sub) => {
          const dirPath = prefix ? `${prefix}/${sub.name}` : sub.name;
          const collapsed = Boolean(collapsedDirs[dirPath]);
          return (
            <li key={dirPath}>
              <button
                type="button"
                className={styles.treeRow}
                style={{ paddingLeft: `${8 + depth * 12}px` }}
                aria-expanded={!collapsed}
                onClick={() => toggleDir(dirPath)}
              >
                <span className={styles.treeChevron}>
                  {collapsed ? icons["chevron-right"] : icons["chevron-down"]}
                </span>
                {icons["file-directory"]}
                <span className={styles.treeName}>{sub.name}</span>
              </button>
              {!collapsed ? (
                <ul className={styles.treeGroup}>
                  {renderTree(sub, dirPath, depth + 1)}
                </ul>
              ) : null}
            </li>
          );
        })}
        {folder.files.map((f) => (
          <li key={f.path}>
            <button
              type="button"
              className={cx(
                styles.treeRow,
                openFile === f.path && styles.treeRowActive,
              )}
              style={{ paddingLeft: `${24 + depth * 12}px` }}
              aria-label={f.path}
              onClick={() => openCodeFile(f.path)}
            >
              {icons.file}
              <span className={styles.treeName}>{f.name}</span>
            </button>
          </li>
        ))}
      </>
    );
  };

  const filteredPalette = PALETTE_PROJECTS.filter(
    (item) =>
      item.name.toLowerCase().includes(paletteQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(paletteQuery.toLowerCase()),
  );

  return (
    <figure
      ref={root}
      className={cx(styles.preview, className)}
      role="group"
      aria-label={p.label}
      data-capture=""
    >
      <div className={styles.window}>
        {/* Real Oxide titlebar: minimal 34px strip with only the right-dock toggle */}
        <div className={styles.titlebar}>
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
                  <span className={styles.backProject}>{project.name}</span>
                  <span className={styles.backSuffix}>
                    · {p.backToTerminals}
                  </span>
                </button>
                <ul className={styles.fileList}>{renderTree(tree)}</ul>
              </div>
            ) : (
              <>
                <div className={styles.sideTop}>
                  <button
                    type="button"
                    className={styles.openProjectBtn}
                    onClick={() => setPaletteOpen((o) => !o)}
                  >
                    {icons.repo}
                    {p.openProject}
                  </button>
                </div>
                <ul className={styles.projectList}>
                  {PREVIEW_PROJECTS.map((proj) => {
                    const active = proj.id === project.id;
                    const projTerms = [
                      ...proj.terminals,
                      ...(extraTerminals[proj.id] ?? []),
                    ];
                    return (
                      <li key={proj.id} className={styles.projectNode}>
                        <div
                          className={cx(
                            styles.projectRow,
                            active && styles.projectSelected,
                          )}
                        >
                          <button
                            type="button"
                            className={styles.projectBtn}
                            onClick={() => selectProject(proj.id)}
                          >
                            <span className={styles.projectIcon}>
                              {icons.repo}
                            </span>
                            <span className={styles.projectName}>
                              {proj.name}
                            </span>
                          </button>
                          <div className={styles.projectActions}>
                            <button
                              type="button"
                              className={styles.rowIcon}
                              aria-label={`Files of ${proj.name}`}
                              onClick={() => openFilesFor(proj.id)}
                            >
                              {icons["file-directory"]}
                            </button>
                            <button
                              type="button"
                              className={styles.rowIcon}
                              aria-label={`New terminal in ${proj.name}`}
                              onClick={() => spawnTerminal(proj.id)}
                            >
                              {icons.plus}
                            </button>
                          </div>
                        </div>
                        <ul className={styles.terminalList}>
                          {projTerms.map((term) => {
                            const termActive =
                              active && term.id === terminal.id;
                            return (
                              <li key={term.id}>
                                <button
                                  type="button"
                                  className={cx(
                                    styles.terminalRow,
                                    termActive && styles.terminalActive,
                                  )}
                                  aria-current={termActive ? "true" : undefined}
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
            <div className={styles.sideFoot}>
              {icons.gear}
              <span>{p.settings}</span>
            </div>
          </div>

          {/* Centre: Terminal half + optional Code half */}
          <div className={styles.centre}>
            {showTerminal ? (
              <section
                className={cx(
                  styles.terminalHalf,
                  showCode && styles.splitTerminal,
                )}
                aria-label="Terminal"
              >
                <header className={styles.halfHeader}>
                  {icons.terminal}
                  <strong>{terminal.shell}</strong>
                  <span className={styles.cwd}>{terminal.cwd}</span>
                  {codeFile ? (
                    <button
                      type="button"
                      className={styles.halfToggle}
                      aria-label={
                        maximized === "terminal"
                          ? "Restore terminal"
                          : "Maximize terminal"
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
                </header>

                <div ref={blocksRef} className={styles.blockScroll}>
                  {blocks.map((block) => (
                    <article key={block.id} className={styles.commandBlock}>
                      <header className={styles.blockHeader}>
                        <span className={styles.blockPrompt} aria-hidden="true">
                          $
                        </span>
                        <code className={styles.blockCmd}>{block.command}</code>
                        <span className={styles.blockDuration}>
                          {block.duration}
                        </span>
                      </header>
                      {block.output.length > 0 ? (
                        <pre className={styles.blockOutput}>
                          {block.output.map((line, i) => (
                            <span
                              key={i}
                              className={
                                line.tone === "ok"
                                  ? styles.outOk
                                  : line.tone === "dim"
                                    ? styles.outDim
                                    : undefined
                              }
                            >
                              {line.text}
                              {i < block.output.length - 1 ? "\n" : ""}
                            </span>
                          ))}
                        </pre>
                      ) : null}
                    </article>
                  ))}
                  {blocks.length > 0 ? (
                    <div className={styles.restoredRule} aria-hidden="true">
                      <span>{p.restored}</span>
                    </div>
                  ) : null}
                </div>

                <form
                  className={styles.promptBar}
                  onSubmit={(e) => {
                    e.preventDefault();
                    runCommand();
                  }}
                >
                  <span className={styles.promptSigil} aria-hidden="true">
                    $
                  </span>
                  <input
                    className={styles.promptInput}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={p.commandPlaceholder}
                    aria-label={p.commandPlaceholder}
                  />
                  <button
                    type="submit"
                    className={styles.runBtn}
                    aria-label={p.run}
                  >
                    <kbd>↵</kbd>
                  </button>
                </form>
              </section>
            ) : null}

            {showCode && codeFile ? (
              <section className={styles.codeHalf} aria-label="Code workspace">
                <header className={styles.codeTabsBar}>
                  <div className={styles.codeTab}>
                    <span>{codeFile.name}</span>
                    <button
                      type="button"
                      className={styles.tabClose}
                      aria-label={`Close ${codeFile.name}`}
                      onClick={() => {
                        setOpenFile(null);
                        setMaximized(null);
                      }}
                    >
                      {icons.x}
                    </button>
                  </div>
                  <div className={styles.codeTabsActions}>
                    <button
                      type="button"
                      className={styles.halfToggle}
                      aria-label={
                        maximized === "code" ? "Restore code" : "Maximize code"
                      }
                      onClick={() =>
                        setMaximized((m) => (m === "code" ? null : "code"))
                      }
                    >
                      {maximized === "code"
                        ? icons["screen-normal"]
                        : icons["screen-full"]}
                    </button>
                  </div>
                </header>
                <div className={styles.codeBody}>
                  {codeFile.lines.map((line, i) => (
                    <div key={i} className={styles.codeLine}>
                      <span className={styles.lineNo}>{i + 1}</span>
                      <code>{highlight(line)}</code>
                    </div>
                  ))}
                </div>
                <footer className={styles.codeStatus}>
                  <span className={styles.codeDiag}>
                    {icons.alert}
                    <span>0 errors · 0 warnings</span>
                  </span>
                  <span className={styles.codeLang}>
                    Ln 1, Col 1 &nbsp; &lt;&gt; {codeFile.language} · LSP
                    stopped
                  </span>
                </footer>
              </section>
            ) : null}
          </div>

          {/* Right dock: Issues and Pull request Surfaces */}
          {toolsOpen ? (
            <aside className={styles.dock} aria-label="Tools">
              <div className={styles.dockTabs}>
                <div className={styles.dockTabList} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={surface === "issues"}
                    className={cx(
                      styles.dockTab,
                      surface === "issues" && styles.dockTabActive,
                    )}
                    onClick={() => setSurface("issues")}
                  >
                    {icons["issue-opened"]}
                    {p.surfaces.issues}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={surface === "pr"}
                    className={cx(
                      styles.dockTab,
                      surface === "pr" && styles.dockTabActive,
                    )}
                    onClick={() => setSurface("pr")}
                  >
                    {icons["git-pull-request"]}
                    {p.surfaces.pr}
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.dockClose}
                  aria-label="Close Tools panel"
                  onClick={() => setToolsOpen(false)}
                >
                  {icons.x}
                </button>
              </div>

              {surface === "pr" ? (
                activePr ? (
                  <div className={styles.surface}>
                    <div className={styles.surfaceToolbar}>
                      <button
                        type="button"
                        className={styles.backSurfaceBtn}
                        onClick={() => setPrNum(null)}
                      >
                        {icons["arrow-left"]}
                        <span>{p.pr.back}</span>
                      </button>
                      <span className={styles.toolbarIcons} aria-hidden="true">
                        {icons.link}
                        {icons["mark-github"]}
                      </span>
                    </div>

                    <div className={styles.surfaceScroll}>
                      <h3 className={styles.surfaceTitle}>
                        {activePr.title}{" "}
                        <span className={styles.surfaceNum}>
                          {activePr.number}
                        </span>
                      </h3>
                      <div className={styles.metaRow}>
                        <span
                          className={cx(
                            styles.statePill,
                            prMerged && activePr.number === "#143"
                              ? styles.pillMerged
                              : styles.pillOpen,
                          )}
                        >
                          {prMerged && activePr.number === "#143"
                            ? icons["git-merge"]
                            : icons["git-pull-request"]}
                          {prMerged && activePr.number === "#143"
                            ? "Merged"
                            : "Open"}
                        </span>
                        <span className={styles.metaText}>
                          {activePr.author} opened {activePr.age}
                        </span>
                      </div>
                      <div className={styles.branchRow}>
                        <span className={styles.branchChip}>
                          {activePr.head} → {activePr.base}
                        </span>
                      </div>
                      <div className={styles.diffStats}>
                        <span className={styles.statAdd}>
                          {activePr.statsAdd}
                        </span>
                        <span className={styles.statDel}>
                          {activePr.statsDel}
                        </span>
                        <span className={styles.metaText}>
                          {activePr.statsFiles}
                        </span>
                      </div>

                      <div className={styles.surfaceCard}>
                        <button
                          type="button"
                          className={styles.cardToggle}
                          onClick={() => setDescOpen((d) => !d)}
                        >
                          <span>Description</span>
                          {descOpen
                            ? icons["chevron-down"]
                            : icons["chevron-right"]}
                        </button>
                        {descOpen ? (
                          <p className={styles.cardBody}>
                            {activePr.description}
                          </p>
                        ) : null}
                      </div>

                      <div className={styles.surfaceCard}>
                        <div className={styles.checkRow}>
                          <span className={styles.checkOk}>
                            {icons["check-circle-fill"]}
                          </span>
                          <span>{p.pr.noConflicts}</span>
                        </div>
                        <div className={styles.checkRow}>
                          <span className={styles.checkOk}>
                            {icons["check-circle-fill"]}
                          </span>
                          <span>{p.pr.allChecksPassed}</span>
                        </div>
                      </div>

                      <div className={styles.surfaceCard}>
                        <div className={styles.checksHead}>
                          <strong>Checks</strong>
                          <span className={styles.metaText}>
                            {activePr.checks.length} passed
                          </span>
                          <span className={styles.checksBar} />
                        </div>
                        <ul className={styles.checkList}>
                          {activePr.checks.map((c) => (
                            <li key={c.name}>
                              <span className={styles.checkOk}>
                                {icons["check-circle-fill"]}
                              </span>
                              <span className={styles.checkName}>{c.name}</span>
                              {c.optional ? (
                                <span className={styles.optionalPill}>
                                  Not required
                                </span>
                              ) : null}
                              <span className={styles.checkPass}>Passed</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.surfaceCard}>
                        <div className={styles.cardHead}>
                          <strong>Reviewers</strong>
                          <span className={styles.metaText}>{icons.gear}</span>
                        </div>
                        <div className={styles.reviewerRow}>
                          <span className={styles.avatar}>M</span>
                          <span>{activePr.reviewer}</span>
                        </div>
                      </div>
                    </div>

                    <footer className={styles.surfaceFooter}>
                      {prMerged && activePr.number === "#143" ? (
                        <div className={styles.mergedStatus}>
                          <span className={styles.mergedIcon}>
                            {icons["git-merge"]}
                          </span>
                          <span>{p.pr.merged}</span>
                        </div>
                      ) : (
                        <>
                          <div className={styles.readyLine}>
                            <span className={styles.checkOk}>
                              {icons["check-circle-fill"]}
                            </span>
                            <span>{p.pr.ready}</span>
                          </div>
                          <div className={styles.prActions}>
                            <button type="button" className={styles.secBtn}>
                              {icons.x}
                              {p.pr.close}
                            </button>
                            <button
                              type="button"
                              className={styles.primaryBtn}
                              onClick={() => setPrMerged(true)}
                            >
                              {icons["git-merge"]}
                              {p.pr.merge}
                            </button>
                          </div>
                          <p className={styles.mergeHint}>{p.pr.note}</p>
                        </>
                      )}
                    </footer>
                  </div>
                ) : (
                  <div className={styles.surface}>
                    <div className={styles.surfaceToolbar}>
                      <span className={styles.toolbarHeading}>
                        Pull requests
                      </span>
                    </div>
                    <ul className={styles.itemList}>
                      {PREVIEW_PRS.map((pr) => (
                        <li key={pr.number}>
                          <button
                            type="button"
                            className={styles.itemRow}
                            onClick={() => setPrNum(pr.number)}
                          >
                            <span className={styles.itemTitle}>
                              {pr.number} · {pr.title}
                            </span>
                            <span className={styles.itemMeta}>
                              {pr.head} · {pr.author} {pr.age}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ) : activeIssue ? (
                <div className={styles.surface}>
                  <div className={styles.surfaceToolbar}>
                    <button
                      type="button"
                      className={styles.backSurfaceBtn}
                      onClick={() => setIssueNum(null)}
                    >
                      {icons["arrow-left"]}
                      <span>{p.issue.back}</span>
                    </button>
                    <span className={styles.toolbarIcons} aria-hidden="true">
                      {icons.link}
                      {icons["mark-github"]}
                    </span>
                  </div>

                  <div className={styles.surfaceScroll}>
                    <h3 className={styles.surfaceTitle}>
                      {activeIssue.title}{" "}
                      <span className={styles.surfaceNum}>
                        {activeIssue.number}
                      </span>
                    </h3>
                    <div className={styles.metaRow}>
                      {(() => {
                        const isClosed =
                          closedIssues[activeIssue.number] ??
                          activeIssue.state === "closed";
                        return (
                          <span
                            className={cx(
                              styles.statePill,
                              isClosed ? styles.pillMerged : styles.pillOpen,
                            )}
                          >
                            {isClosed
                              ? icons["issue-closed"]
                              : icons["issue-opened"]}
                            {isClosed ? "Closed" : "Open"}
                          </span>
                        );
                      })()}
                      <span className={styles.metaText}>
                        {activeIssue.author} opened {activeIssue.age}
                      </span>
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.commentHead}>
                        <span className={styles.avatar}>
                          {activeIssue.author[0].toUpperCase()}
                        </span>
                        <strong>{activeIssue.author}</strong>
                        <span className={styles.authorBadge}>Author</span>
                        <span className={styles.metaText}>wrote</span>
                      </div>
                      <p className={styles.cardBody}>{activeIssue.bodyLead}</p>
                      <ul className={styles.issueBullets}>
                        {activeIssue.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      {activeIssue.reactions > 0 ? (
                        <div className={styles.reactionPill}>
                          {icons.thumbsup}
                          <span>{activeIssue.reactions}</span>
                        </div>
                      ) : null}
                    </div>

                    {activeIssue.subIssues.length > 0 ? (
                      <div className={styles.surfaceCard}>
                        <div className={styles.checksHead}>
                          {icons.checklist}
                          <strong>Sub-issues</strong>
                          <span className={styles.metaText}>
                            {activeIssue.subIssues.filter((s) => s.done).length}
                            /{activeIssue.subIssues.length}
                          </span>
                          <span className={styles.checksBar} />
                        </div>
                        <ul className={styles.checkList}>
                          {activeIssue.subIssues.map((sub) => (
                            <li key={sub.number}>
                              <span
                                className={
                                  sub.done ? styles.subClosed : styles.subOpened
                                }
                              >
                                {sub.done
                                  ? icons["issue-closed"]
                                  : icons["issue-opened"]}
                              </span>
                              <span className={styles.checkName}>
                                {sub.title}
                              </span>
                              <span className={styles.metaText}>
                                {sub.number}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className={styles.surfaceCard}>
                      <div className={styles.cardHead}>
                        <span className={styles.cardLabel}>
                          {icons.people}
                          <strong>Assignees</strong>
                        </span>
                        <span className={styles.metaText}>{icons.gear}</span>
                      </div>
                      <div className={styles.reviewerRow}>
                        <span className={styles.avatar}>
                          {activeIssue.assignee[0].toUpperCase()}
                        </span>
                        <span>{activeIssue.assignee}</span>
                      </div>
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.cardHead}>
                        <span className={styles.cardLabel}>
                          {icons.tag}
                          <strong>Labels</strong>
                        </span>
                        <span className={styles.metaText}>{icons.gear}</span>
                      </div>
                      <div className={styles.labelRow}>
                        {activeIssue.labels.map((label) => (
                          <span
                            key={label.name}
                            className={cx(
                              styles.issueLabel,
                              label.tone === "red"
                                ? styles.labelRed
                                : label.tone === "blue"
                                  ? styles.labelBlue
                                  : styles.labelPurple,
                            )}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <footer className={styles.surfaceFooter}>
                    {(() => {
                      const isClosed =
                        closedIssues[activeIssue.number] ??
                        activeIssue.state === "closed";
                      return (
                        <button
                          type="button"
                          className={styles.primaryBtnFull}
                          onClick={() =>
                            setClosedIssues((prev) => ({
                              ...prev,
                              [activeIssue.number]: !isClosed,
                            }))
                          }
                        >
                          {isClosed ? p.issue.reopen : p.issue.close}
                        </button>
                      );
                    })()}
                  </footer>
                </div>
              ) : (
                <div className={styles.surface}>
                  <div className={styles.surfaceToolbar}>
                    <span className={styles.toolbarHeading}>Issues</span>
                  </div>
                  <ul className={styles.itemList}>
                    {PREVIEW_ISSUES.map((issue) => (
                      <li key={issue.number}>
                        <button
                          type="button"
                          className={styles.itemRow}
                          onClick={() => setIssueNum(issue.number)}
                        >
                          <span className={styles.itemTitle}>
                            {issue.number} · {issue.title}
                          </span>
                          <span className={styles.itemMeta}>
                            {issue.author} · {issue.age}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          ) : null}

          {/* Project palette overlay */}
          {paletteOpen ? (
            <div
              className={styles.paletteBackdrop}
              onClick={() => setPaletteOpen(false)}
            >
              <div
                className={styles.palette}
                role="dialog"
                aria-label="Project palette"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.paletteTop}>
                  <span>{p.paletteHeader}</span>
                  <input
                    type="text"
                    className={styles.paletteInput}
                    value={paletteQuery}
                    onChange={(e) => setPaletteQuery(e.target.value)}
                    placeholder={p.palettePlaceholder}
                    aria-label={p.palettePlaceholder}
                  />
                </div>
                <ul className={styles.paletteList}>
                  {filteredPalette.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.paletteRow}
                        onClick={() => selectProject(item.id)}
                      >
                        <span className={styles.paletteName}>
                          {icons.repo}
                          <span>{item.name}</span>
                          {item.open ? (
                            <span className={styles.openBadge}>open</span>
                          ) : null}
                        </span>
                        <span className={styles.palettePath}>{item.path}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <figcaption className={styles.caption}>{p.hint}</figcaption>
    </figure>
  );
}
