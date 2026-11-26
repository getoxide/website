# Stable installer links follow GitHub's latest release

From v1.0.0, Oxide's first stable release, its installers carry short versionless names (`Oxide.dmg`, `Oxide-x64.exe`, `Oxide-arm64.exe`, `Oxide-x64.AppImage`, `Oxide-x64.deb`, `Oxide-x64.rpm` and the three `Oxide-arm64` Linux files). So `https://github.com/getoxide/oxide/releases/latest/download/<name>` always serves the newest stable build, and the site links that form: in the `stable` Release state the sync writes each installer's URL as GitHub's `latest` redirect, and a new release's files are live on the site the moment it is published, before any sync. A test pre-release keeps its tag's own URL, because `latest` never points at one; the versioned names of the v0.0.x pre-releases are still matched, so the site keeps its current state until v1.0.0 exists. Version, date, sizes and the changelog still come from the Snapshot (ADR-0003), which the content sync now refreshes **hourly** instead of daily: a cross-repo trigger from the Oxide release workflow needs an extra token, which was rejected, and a run whose Snapshot is unchanged stops after the sync step.

This replaces decision 2 of [Download experience and pre-release state](https://github.com/getoxide/website/issues/13) (exact versioned asset URLs). Decision 3 stands and now covers three platforms and the header: the inline script orders and highlights the visitor's platform (macOS first without JavaScript), never changes a link's target, never redirects and never starts a download.

In the `stable` state the header Download button opens a `<details>` menu, like the small-screen menu, so it needs no JavaScript and adds no hydration: macOS, Windows and Linux as direct downloads with the Download block's sublabels, then GitHub and **All downloads** (`/download`, where the signing notes, the additional builds and the package repositories are). In the other states it still links to `/download`, so a pre-release is never offered without its warning.

## Considered options

- **Keep versioned URLs from the Snapshot**: rejected, a new release is invisible on the site until the next sync.
- **Link `releases/latest` (the release page)**: rejected, the visitor has to find their file among the updater and repository assets.
- **Trigger the sync from the Oxide release workflow**: rejected, it needs a cross-repo token.
- **A JavaScript dropdown in the header**: rejected, it would hydrate on every page against the reading budget.
