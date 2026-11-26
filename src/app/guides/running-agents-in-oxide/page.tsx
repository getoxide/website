import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find((g) => g.page.path === PAGES.guidesAgents.path)!;

export const metadata = pageMetadata(PAGES.guidesAgents);

export default function RunningAgentsInOxidePage() {
  return <GuideArticle guide={guide} />;
}
