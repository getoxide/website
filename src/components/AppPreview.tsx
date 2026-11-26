import { AppPreviewApp, type PreviewIcons } from "./AppPreviewApp";
import { Icon } from "./Icon";

const NAMES = [
  "repo",
  "file-directory",
  "sidebar-expand",
  "plus",
  "arrow-left",
  "gear",
  "terminal",
  "file",
  "issue-opened",
  "issue-closed",
  "git-pull-request",
  "git-merge",
  "x",
  "check-circle-fill",
  "check",
  "screen-full",
  "screen-normal",
  "chevron-down",
  "chevron-right",
  "link",
  "mark-github",
  "alert",
  "thumbsup",
  "search",
  "checklist",
  "people",
  "tag",
] as const;

/**
 * The interactive app preview (Design system, App preview; ADR-0004). This
 * server part renders the Octicons once, so the icon package never reaches
 * the browser, and hands them to the client app.
 */
export function AppPreview({ className }: { className?: string }) {
  const icons = Object.fromEntries(
    NAMES.map((name) => [name, <Icon key={name} name={name} />]),
  ) as PreviewIcons;
  return <AppPreviewApp icons={icons} className={className} />;
}
