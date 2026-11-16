# A live app preview in place of the hero capture

The home hero and the three Provider landing pages show the Oxide workbench as real HTML that plays one Turn, from the prompt to the merged pull request, instead of a still or a video loop. Cursor and Claude Code present their products this way: text stays sharp at every size, the scene can loop without a 1.5 MB video, and on a phone the window is relaid at the app's own text size rather than shrunk. This partly supersedes ADR-0001's rule that product visuals are "never DOM re-creations of the app UI", and the Capture frame's "never a mock-up" in the Design system: the exception is this one component, the **App preview**.

Its limits keep it honest and cheap:

- **One scene, faithful to the product.** It renders the same Thread as the hero Capture (`assets/captures/hero.png`), with the app's own layout and the synced `--ox-*` tokens the app is built on. It shows only what Oxide does; when the app's UI changes, the scene follows.
- **The server HTML is the finished scene.** Without JavaScript, or under reduced motion, the visitor sees the merged pull request; nothing waits for hydration and nothing carries `opacity: 0` inline.
- **Playing never moves the page.** Every piece always takes its place in the layout; a small client component only changes two custom properties (`--beat`, `--typed`) that the CSS turns into opacity. No layout shift, no Motion library.
- **Pause, stop, hide.** It plays only while on screen and the tab is visible, and has a visible pause/play button (WCAG 2.2.2).
- **It is product UI, not site copy.** It is one `role="img"` with an accessible name, its inner markup `aria-hidden`, and it is marked `data-capture` so the copy gates read it as they read a Capture's pixels.

## Considered options

- **Keep the still capture**: rejected, the product owner asked for a preview that shows the loop working, as the reference sites do.
- **A video loop**: rejected for the hero, it blurs small UI text, costs up to 1.5 MB per loop and cannot relayout on a phone.
- **Embed the real app** (the Oxide web bundle with a fixture IPC): rejected, tens of MB of JavaScript against a 185 kB showcase ceiling.
