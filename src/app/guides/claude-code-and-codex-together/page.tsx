import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find(
  ({ page }) => page.path === "/guides/claude-code-and-codex-together",
)!;

export const metadata = pageMetadata(guide.page);

/** `/guides/claude-code-and-codex-together`: one writes, the other reviews. */
export default function ClaudeCodeAndCodexPage() {
  return <GuideArticle guide={guide} />;
}
