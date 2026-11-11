import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES } from "@/content/guides";
import { pageMetadata } from "@/lib/metadata";

const guide = GUIDES.find(
  ({ page }) => page.path === "/guides/review-ai-generated-code",
)!;

export const metadata = pageMetadata(guide.page);

/** `/guides/review-ai-generated-code`: the four-step review method. */
export default function ReviewAiGeneratedCodePage() {
  return <GuideArticle guide={guide} />;
}
