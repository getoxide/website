import { ProviderPage } from "@/components/ProviderPage";
import { PAGES } from "@/content/pages";
import { PROVIDER_PAGES } from "@/content/provider-pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.codexGui);

export default function CodexGuiPage() {
  return <ProviderPage page={PAGES.codexGui} copy={PROVIDER_PAGES.codex} />;
}
