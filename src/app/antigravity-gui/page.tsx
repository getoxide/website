import { ProviderPage } from "@/components/ProviderPage";
import { PAGES } from "@/content/pages";
import { PROVIDER_PAGES } from "@/content/provider-pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.antigravityGui);

export default function AntigravityGuiPage() {
  return (
    <ProviderPage
      page={PAGES.antigravityGui}
      copy={PROVIDER_PAGES.antigravity}
    />
  );
}
