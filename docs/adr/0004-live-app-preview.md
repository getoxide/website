# An interactive app preview in place of the hero capture

The home hero and the three Provider landing pages show the Oxide workbench as real HTML the visitor can explore, instead of a still or a video loop: switch Threads, open a file's hunk, answer the agent, allow an Approval, run a Blind review, Commit & Push and Merge. Cursor and Claude Code present their products this way: text stays sharp at every size, nothing weighs like a video, and on a phone the window is relaid at the app's own text size rather than shrunk. This partly supersedes ADR-0001's rule that product visuals are "never DOM re-creations of the app UI", and the Capture frame's "never a mock-up" in the Design system: the exception is this one component, the **App preview**.

Its limits keep it honest and cheap:

- **Faithful to the product.** It opens on the same Thread as the hero Capture (`assets/captures/hero.png`), with the app's own layout and the synced `--ox-*` tokens the app is built on. It shows only what Oxide does; when the app's UI changes, the preview follows. The composer says plainly that no agent is attached.
- **Nothing moves by itself.** No autoplay, no loop: every change follows a click or a key. The server HTML is the starting state, complete without JavaScript; nothing carries `opacity: 0` inline.
- **It never moves the page.** The window has a fixed height at every width and its panes scroll inside it. No Motion library; the Octicons are rendered on the server, so the icon package never reaches the browser.
- **Accessible, and not site copy.** A named `role="group"` of real buttons and an input, keyboard operable, targets of at least 24px. It is marked `data-capture`, so the copy gates read it as they read a Capture's pixels.

## Considered options

- **Keep the still capture**: rejected, the product owners asked for a preview that shows the loop working, as the reference sites do.
- **A scripted scene that plays by itself**: tried first and rejected, the visitor should drive it, not watch an autopilot.
- **A video loop**: rejected for the hero, it blurs small UI text, costs up to 1.5 MB per loop and cannot relayout on a phone.
- **Embed the real app** (the Oxide web bundle with a fixture IPC): rejected, tens of MB of JavaScript against a 185 kB showcase ceiling.
