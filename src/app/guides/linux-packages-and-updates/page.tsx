import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find((g) => g.page.path === PAGES.guidesLinux.path)!;

export const metadata = pageMetadata(PAGES.guidesLinux);

export default function LinuxPackagesAndUpdatesPage() {
  return <GuideArticle guide={guide} />;
}
