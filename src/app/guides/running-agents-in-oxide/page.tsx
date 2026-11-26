import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES[0];

export const metadata = pageMetadata(PAGES.guidesAgents);

export default function RunningAgentsInOxidePage() {
  return <GuideArticle guide={guide} />;
}
