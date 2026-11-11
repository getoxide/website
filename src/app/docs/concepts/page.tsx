import { PageHeader } from "@/components/PageHeader";
import { SiteFrame } from "@/components/SiteFrame";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.docsConcepts);

export default function ConceptsPage() {
  return (
    <SiteFrame page={PAGES.docsConcepts}>
      <PageHeader title={PAGES.docsConcepts.h1} />
    </SiteFrame>
  );
}
