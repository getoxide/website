import type { CSSProperties, ReactNode } from "react";
import {
  BEATS,
  PREVIEW,
  PREVIEW_PROVIDERS,
  type PreviewProvider,
} from "@/content/app-preview";
import { AppPreviewPlayer } from "./AppPreviewPlayer";
import { Icon } from "./Icon";
import styles from "./AppPreview.module.css";

type Beat = (typeof BEATS)[keyof typeof BEATS];

/** A Thread's state in the list, as the app colours its dot. */
const STATUS = {
  input: "statusInput",
  approval: "statusApproval",
  done: "statusDone",
  idle: "statusIdle",
} as const;

/** The beat an element appears at, and the one it leaves at if replaced. */
const at = (from: Beat, until?: Beat, delay = 0): CSSProperties =>
  ({
    "--at": from,
    ...(until === undefined ? {} : { "--until": until }),
    ...(delay ? { "--d": `${delay}ms` } : {}),
  }) as CSSProperties;

/** A piece of the scene that appears (and maybe leaves) on a beat. */
function B({
  from,
  until,
  delay,
  className,
  as: Tag = "div",
  children,
}: {
  from: Beat;
  until?: Beat;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "li" | "p";
  children: ReactNode;
}) {
  return (
    <Tag
      className={[styles.b, className].filter(Boolean).join(" ")}
      style={at(from, until, delay)}
    >
      {children}
    </Tag>
  );
}

/** The Provider's glyph: a neutral shape, never the vendor's logo. */
function Glyph({ provider }: { provider: PreviewProvider }) {
  return (
    <span className={`${styles.glyph} ${styles[provider]}`} aria-hidden="true">
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

/**
 * The live app preview (Design system, App preview): the Oxide workbench as
 * real HTML, playing one Turn from the prompt to the merged pull request. The
 * server renders the finished scene, which is what a visitor without
 * JavaScript or with reduced motion sees; `AppPreviewPlayer` replays it. It
 * takes the place of the hero Capture and sits in the same frame.
 */
export function AppPreview({
  provider = "claude",
  className,
}: {
  provider?: PreviewProvider;
  className?: string;
}) {
  const p = PREVIEW;
  const { model, chip } = PREVIEW_PROVIDERS[provider];
  const words = p.prompt.split(" ");
  const [first, ...others] = p.threads;
  return (
    <AppPreviewPlayer
      className={[styles.preview, className].filter(Boolean).join(" ")}
      stageClassName={styles.stage}
      toggleClassName={styles.toggle}
      label={p.label(provider)}
      pauseLabel={p.pause}
      playLabel={p.play}
      words={words.length}
    >
      <div className={styles.window} aria-hidden="true">
        <div className={styles.titlebar}>
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.projectPill}>
            <Icon name="repo" />
            {p.project}
          </span>
          <span className={styles.path}>
            <Icon name="file-directory" />
            {p.path}
          </span>
          <span className={styles.titleIcons}>
            <Icon name="bell" />
            <Icon name="file-directory" />
            <span className={styles.iconOn}>
              <Icon name="sidebar-expand" />
            </span>
          </span>
        </div>

        <div className={styles.body}>
          {/* Threads */}
          <div className={styles.sidebar}>
            <div className={styles.sideTop}>
              <span className={styles.newThread}>
                <Icon name="plus" />
                {p.newThread}
              </span>
              <span className={styles.square}>
                <Icon name="repo" />
              </span>
            </div>
            <div className={styles.search}>
              <Icon name="search" />
              {p.search}
            </div>
            <div className={styles.group}>
              <Icon name="chevron-down" />
              <Icon name="repo" />
              {p.project}
            </div>
            <ul className={styles.threads}>
              <B as="li" from={BEATS.sent} className={styles.threadActive}>
                <span className={styles.dotStack}>
                  <B
                    as="span"
                    from={BEATS.sent}
                    until={BEATS.answered}
                    className={`${styles.dot} ${styles.running}`}
                  >
                    {""}
                  </B>
                  <B
                    as="span"
                    from={BEATS.answered}
                    className={`${styles.dot} ${styles.done}`}
                  >
                    {""}
                  </B>
                </span>
                <span className={styles.threadTitle}>{p.title}</span>
                <Icon name="git-branch" className={styles.muted} />
                <span className={styles.age}>now</span>
              </B>
              <li>
                <span
                  className={`${styles.dot} ${styles[STATUS[first.status]]}`}
                />
                <span className={styles.threadTitle}>{first.title}</span>
                <span className={styles.age}>{first.age}</span>
              </li>
              {others.map((t) => (
                <li key={t.title}>
                  <span
                    className={`${styles.dot} ${styles[STATUS[t.status]]}`}
                  />
                  <span className={styles.threadTitle}>{t.title}</span>
                  <span className={styles.age}>{t.age}</span>
                </li>
              ))}
            </ul>
            <div className={styles.settings}>
              <Icon name="gear" />
              {p.settings}
            </div>
          </div>

          {/* The Thread */}
          <div className={styles.thread}>
            <div className={styles.tabs}>
              <span className={styles.tabOn}>{p.tabs.thread}</span>
              <span>{p.tabs.code}</span>
            </div>
            <div className={styles.header}>
              <span className={styles.avatar}>
                <Glyph provider={provider} />
              </span>
              <div className={styles.headText}>
                <div className={styles.stack}>
                  <B
                    from={BEATS.empty}
                    until={BEATS.answered}
                    className={styles.title}
                  >
                    {p.newThread}
                  </B>
                  <B from={BEATS.answered} className={styles.title}>
                    {p.title}
                  </B>
                </div>
                <B from={BEATS.answered} className={styles.headRow}>
                  <span className={styles.branch}>
                    <Icon name="git-branch" />
                    {p.branch}
                    <Icon name="chevron-down" />
                  </span>
                  <span className={styles.chip}>
                    <span className={styles.add}>+{p.diffstat.added}</span>
                    <span className={styles.del}>−{p.diffstat.removed}</span>
                  </span>
                  <span className={styles.stack}>
                    <B
                      as="span"
                      from={BEATS.answered}
                      until={BEATS.pushed}
                      className={styles.commit}
                    >
                      <Icon name="git-commit" />
                      {p.commit}
                      <span className={styles.commitMore}>
                        <Icon name="triangle-down" />
                      </span>
                    </B>
                    <B
                      as="span"
                      from={BEATS.pushed}
                      until={BEATS.merged}
                      className={`${styles.pr} ${styles.prOpen}`}
                    >
                      <Icon name="git-pull-request" />
                      {p.pr.number} · {p.pr.open}
                    </B>
                    <B
                      as="span"
                      from={BEATS.merged}
                      className={`${styles.pr} ${styles.prMerged}`}
                    >
                      <Icon name="git-merge" />
                      {p.pr.number} · {p.pr.merged}
                    </B>
                  </span>
                </B>
              </div>
            </div>

            <div className={styles.messages}>
              <B from={BEATS.sent} className={styles.user}>
                <p className={styles.bubble}>{p.prompt}</p>
                <span className={styles.meta}>
                  <Icon name="person" />
                  {p.you}
                </span>
              </B>

              <B from={BEATS.sent} className={styles.agent}>
                <div className={styles.agentHead}>
                  <Glyph provider={provider} />
                  <span>{model}</span>
                </div>
                <div className={styles.stack}>
                  <B
                    from={BEATS.sent}
                    until={BEATS.answered}
                    className={styles.activity}
                  >
                    <span className={styles.working}>{p.working}</span>
                    {p.activity.map((a, i) => (
                      <B
                        key={a.target + a.verb}
                        from={(BEATS.read1 + i) as Beat}
                        className={styles.step}
                      >
                        <span className={styles.verb}>{a.verb}</span>
                        <code>{a.target}</code>
                        {"stat" in a ? (
                          <span className={styles.stepStat}>{a.stat}</span>
                        ) : null}
                      </B>
                    ))}
                  </B>
                  <B from={BEATS.answered} className={styles.workedWrap}>
                    <div className={styles.worked}>
                      <Icon name="chevron-right" />
                      <span>{p.worked.summary}</span>
                      <span className={styles.workedTime}>{p.worked.time}</span>
                    </div>
                    <B
                      as="p"
                      from={BEATS.answered}
                      delay={150}
                      className={styles.answer}
                    >
                      {p.answer}
                    </B>
                    <ul className={styles.bullets}>
                      {p.bullets.map((b, i) => (
                        <B
                          as="li"
                          key={b.code}
                          from={BEATS.answered}
                          delay={300 + i * 180}
                        >
                          <code>{b.code}</code> {b.text}
                        </B>
                      ))}
                    </ul>
                    <B
                      as="p"
                      from={BEATS.answered}
                      delay={900}
                      className={styles.answer}
                    >
                      <code>{p.closing.code}</code> {p.closing.text}
                    </B>
                  </B>
                </div>
              </B>
            </div>

            <div className={styles.composer}>
              <div className={`${styles.stack} ${styles.input}`}>
                <B
                  from={BEATS.empty}
                  until={BEATS.typing}
                  className={styles.placeholder}
                >
                  {p.composerEmpty}
                </B>
                <B from={BEATS.typing} until={BEATS.sent}>
                  {words.map((w, i) => (
                    <span
                      key={i}
                      className={styles.piece}
                      style={{ "--i": i } as CSSProperties}
                    >
                      {w}{" "}
                    </span>
                  ))}
                </B>
                <B from={BEATS.sent} className={styles.placeholder}>
                  {p.composerFollowUp}
                </B>
              </div>
              <div className={styles.composerBar}>
                <span className={styles.composerChip}>
                  <Glyph provider={provider} />
                  {chip}
                  <Icon name="chevron-down" />
                </span>
                <span className={styles.composerChip}>
                  <Icon name="shield-check" />
                  {p.permission}
                  <Icon name="chevron-down" />
                </span>
                <span className={styles.composerIcons}>
                  <Mic />
                  <Icon name="paperclip" />
                  <span className={styles.send}>
                    <Icon name="arrow-up" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* The Diff Surface */}
          <div className={styles.diff}>
            <div className={styles.surfaceTabs}>
              <span className={styles.surfaceOn}>
                <Icon name="file-diff" />
                {p.diff.tab}
              </span>
              <Icon name="file" />
              <Icon name="terminal" />
              <Icon name="git-pull-request" />
              <Icon name="issue-opened" />
              <span className={styles.close}>
                <Icon name="x" />
              </span>
            </div>
            <div className={styles.toolbar}>
              <span className={styles.segmented}>
                {p.diff.scopes.map((s, i) => (
                  <span key={s} className={i === 0 ? styles.segOn : undefined}>
                    {s}
                  </span>
                ))}
              </span>
              <span className={styles.blind}>
                <Icon name="eye" />
                {p.diff.blind}
              </span>
            </div>

            <div className={styles.dossier}>
              <div className={styles.dossierHead}>{p.diff.verification}</div>
              {p.diff.commands.map((c, i) => {
                const fresh =
                  i === 0 ? BEATS.ran : i === 1 ? BEATS.answered : null;
                return (
                  <div key={c.command} className={styles.check}>
                    <span className={styles.stack}>
                      <B
                        as="span"
                        from={BEATS.empty}
                        until={fresh ?? undefined}
                        className={`${styles.badge} ${styles.never}`}
                      >
                        {p.diff.never}
                      </B>
                      {fresh !== null ? (
                        <B
                          as="span"
                          from={fresh}
                          className={`${styles.badge} ${
                            i === 0 ? styles.fresh : styles.stale
                          }`}
                        >
                          {i === 0 ? p.diff.fresh : p.diff.stale}
                        </B>
                      ) : null}
                    </span>
                    <code>{c.command}</code>
                    <span className={styles.muted}>{c.label}</span>
                  </div>
                );
              })}
              <B from={BEATS.risks} className={styles.risks}>
                <div className={styles.dossierHead}>{p.diff.risk}</div>
                {p.diff.risks.map((r, i) => (
                  <B
                    key={r.file}
                    from={BEATS.risks}
                    delay={i * 200}
                    className={styles.risk}
                  >
                    <span>{r.text}</span>
                    <code>{r.file}</code>
                  </B>
                ))}
              </B>
            </div>

            <div className={`${styles.stack} ${styles.files}`}>
              <B
                from={BEATS.empty}
                until={BEATS.edit1}
                className={styles.filesEmpty}
              >
                {p.diff.empty}
              </B>
              <ul className={styles.fileList}>
                {p.diff.files.map((f) => (
                  <B
                    as="li"
                    key={f.name}
                    from={
                      f.name === "retry.ts"
                        ? BEATS.edit1
                        : f.name === "dispatcher.ts"
                          ? BEATS.edit2
                          : BEATS.edit3
                    }
                    className={styles.file}
                  >
                    <span
                      className={`${styles.fileStatus} ${
                        f.status === "A" ? styles.added : styles.modified
                      }`}
                    >
                      {f.status}
                    </span>
                    <code className={styles.fileName}>{f.name}</code>
                    <code className={styles.fileDir}>{f.dir}</code>
                    <span className={styles.add}>{f.stat[0]}</span>
                    <span className={styles.del}>{f.stat[1]}</span>
                    <span className={styles.revert}>{p.diff.revert}</span>
                  </B>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppPreviewPlayer>
  );
}
