import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find((g) => g.page.path === PAGES.guidesProjects.path)!;

export const metadata = pageMetadata(PAGES.guidesProjects);

export default function WorkingWithProjectsAndTerminalsPage() {
  return <GuideArticle guide={guide} />;
}
