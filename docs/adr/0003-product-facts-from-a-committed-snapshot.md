# Product facts come from a committed snapshot of the Oxide repo

A sync script extracts the marked README sections, the Concepts allowlist from GLOSSARY.md and the GitHub release data at the latest stable tag into a committed snapshot; builds never touch the network. A daily or dispatched workflow pushes snapshot changes straight to `main` after the site's checks pass, because PRs opened with `GITHUB_TOKEN` trigger no workflows and an extra PAT was rejected. A missing marker or allowlisted term fails the sync and leaves the last good snapshot live.
