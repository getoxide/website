import source from "../../content/oxide/source.json";

/** The Oxide repo and the ref the site's synced files were taken at. */
export const OXIDE = source;

/** A file of the Oxide repo on GitHub, at the synced ref. */
function fileUrl(path: string): string {
  return `https://github.com/${OXIDE.repo}/blob/${OXIDE.ref}/${path}`;
}

/** A README section on GitHub at the synced ref (Copy deck, `README#…`). */
export function readmeUrl(anchor: string): string {
  return fileUrl(`README.md#${anchor}`);
}

/** Oxide's MIT licence, the footer's Licence link. */
export const LICENCE_URL = fileUrl("LICENSE");
