import source from "../../content/oxide/source.json";

/** The Oxide repo, and the ref and commit the synced files were taken at. */
export const OXIDE = source;

/** A stable release tag (`v1.2.3`); `main` is not one. */
const STABLE_TAG = /^v\d+\.\d+\.\d+$/;

/**
 * The ref GitHub links point at. A stable tag never moves, so link at it; a
 * branch does move, so link at the commit the Snapshot was taken from. `ref`
 * stays for display and commit messages (ADR-0003).
 */
export function linkRefOf(source: { ref: string; commit: string }): string {
  return STABLE_TAG.test(source.ref) ? source.ref : source.commit;
}

export const OXIDE_LINK_REF = linkRefOf(OXIDE);

/** A file of the Oxide repo on GitHub, at the pinned link ref. */
function fileUrl(path: string): string {
  return `https://github.com/${OXIDE.repo}/blob/${OXIDE_LINK_REF}/${path}`;
}

/** A README section on GitHub at the pinned link ref (Copy deck, `README#…`). */
export function readmeUrl(anchor: string): string {
  return fileUrl(`README.md#${anchor}`);
}

/** Oxide's MIT licence, the footer's Licence link. */
export const LICENCE_URL = fileUrl("LICENSE");

/** Oxide's GLOSSARY.md, the source of /docs/concepts. */
export const GLOSSARY_URL = fileUrl("GLOSSARY.md");
