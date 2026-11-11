import source from "../../content/oxide/source.json";

/** The Oxide repo and the ref the site's synced files were taken at. */
export const OXIDE = source;

/** A README section on GitHub at the synced ref (Copy deck, `README#…`). */
export function readmeUrl(anchor: string): string {
  return `https://github.com/${OXIDE.repo}/blob/${OXIDE.ref}/README.md#${anchor}`;
}
