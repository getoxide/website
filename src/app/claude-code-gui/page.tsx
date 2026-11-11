import { ProviderPage } from "@/components/ProviderPage";
import { PAGES } from "@/content/pages";
import { PROVIDER_PAGES } from "@/content/provider-pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.claudeCodeGui);

export default function ClaudeCodeGuiPage() {
  return (
    <ProviderPage page={PAGES.claudeCodeGui} copy={PROVIDER_PAGES.claudeCode} />
  );
}
