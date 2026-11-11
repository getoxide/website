import { PAGES } from "@/content/pages";
import { pageMetadata } from "@/lib/metadata";

// Next already adds `<meta name="robots" content="noindex">` to the 404.
export const metadata = { ...pageMetadata(PAGES.notFound), robots: undefined };

export default function NotFound() {
  return <h1>{PAGES.notFound.h1}</h1>;
}
