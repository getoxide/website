import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(PAGES.home);

export default function HomePage() {
  return <h1>{PAGES.home.h1}</h1>;
}
