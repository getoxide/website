import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.privacy);

export default function PrivacyPage() {
  return <h1>{PAGES.privacy.h1}</h1>;
}
