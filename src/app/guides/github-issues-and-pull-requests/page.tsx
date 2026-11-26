import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find((g) => g.page.path === PAGES.guidesGitHub.path)!;

export const metadata = pageMetadata(PAGES.guidesGitHub);

export default function GithubIssuesAndPullRequestsPage() {
  return <GuideArticle guide={guide} />;
}
