import type { PreviewProvider } from "@/content/app-preview";
import type { PreviewIcons } from "./AppPreviewApp";
import { AppPreviewLazy } from "./AppPreviewLazy";
import { Icon } from "./Icon";

const NAMES = [
  "repo",
  "file-directory",
  "bell",
  "sidebar-expand",
  "plus",
  "search",
  "chevron-down",
  "chevron-right",
  "git-branch",
  "gear",
  "git-commit",
  "person",
  "file-diff",
  "file",
  "terminal",
  "git-pull-request",
  "issue-opened",
  "x",
  "eye",
  "shield-check",
  "git-merge",
  "arrow-up",
  "paperclip",
  "check",
  "comment",
  "alert",
] as const;

/**
 * The interactive app preview (Design system, App preview; ADR-0004). This
 * server part renders the Octicons once, so the icon package never reaches
 * the browser, and hands them to the client app with the Provider.
 */
export function AppPreview({
  provider = "claude",
  className,
}: {
  provider?: PreviewProvider;
  className?: string;
}) {
  const icons = Object.fromEntries(
    NAMES.map((name) => [name, <Icon key={name} name={name} />]),
  ) as PreviewIcons;
  return (
    <AppPreviewLazy provider={provider} icons={icons} className={className} />
  );
}
