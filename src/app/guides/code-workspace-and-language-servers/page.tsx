import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find((g) => g.page.path === PAGES.guidesCode.path)!;

export const metadata = pageMetadata(PAGES.guidesCode);

export default function CodeWorkspaceAndLanguageServersPage() {
  return <GuideArticle guide={guide} />;
}
