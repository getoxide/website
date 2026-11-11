import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.docsQuickStart);

export default function QuickStartPage() {
  return (
    <SiteFrame page={PAGES.docsQuickStart}>
      <PageHeader title={PAGES.docsQuickStart.h1} />
    </SiteFrame>
  );
}
