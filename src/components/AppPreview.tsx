import octicons from "@primer/octicons";
import { AppPreviewLazy } from "./AppPreviewLazy";
import type { PreviewIconName, PreviewIcons } from "./AppPreviewApp";

const SIZE = 16;

const NAMES: readonly PreviewIconName[] = [
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
  "screen-full",
  "screen-normal",
  "chevron-down",
  "chevron-right",
  "link",
  "mark-github",
  "alert",
  "thumbsup",
  "checklist",
  "people",
  "tag",
];

/**
 * The interactive app preview (Design system, App preview; ADR-0004). This
 * server part reads the Octicons once at build time so the icon package never
 * reaches the browser, and hands compact `{ w, p }` data to the lazy client app.
 */
export function AppPreview({ className }: { className?: string }) {
  const icons = Object.fromEntries(
    NAMES.map((name) => {
      const entry = octicons[name]?.heights[SIZE];
      if (!entry) throw new Error(`AppPreview: Octicons has no 16px "${name}"`);
      return [name, { w: entry.width, p: entry.path }];
    }),
  ) as PreviewIcons;
  return <AppPreviewLazy icons={icons} className={className} />;
}
