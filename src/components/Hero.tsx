import { Fragment, type CSSProperties } from "react";
import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { PAGES } from "@/content/pages";
import type { CaptureManifest } from "@/lib/captures";
import { SNAPSHOT, tokensOf, type Snapshot } from "@/lib/snapshot";
import { Button } from "./Button";
import { Capture } from "./Capture";
import { HeroMotion } from "./HeroMotion";
import { OxideMark } from "./OxideMark";
import styles from "./Hero.module.css";

const EARLY = `try{document.currentScript.parentElement.setAttribute("data-reveal","")}catch(e){}`;

/**
 * The home hero (Copy deck, Home → Hero, frozen; Design system, Animated
 * mark and Capture frame): the centred mark, the H1 and subheadline, the two
 * buttons and the platform line, over a static radial gradient in `--ox-*`
 * colours so it is complete without WebGL or JavaScript. The H1 is the LCP
 * element: text in the HTML, never waiting for the capture. The hero capture
 * rises over the bottom of the hero; with no source file there is no frame.
 * While no release exists at all the primary reads "Get Oxide".
 */
export function Hero({
  snapshot = SNAPSHOT,
  manifest,
}: {
  snapshot?: Snapshot;
  manifest?: CaptureManifest;
}) {
  const copy = COPY.hero;
  const none = snapshot.release.state === "none";
  const platforms = tokensOf(snapshot)("platforms");
  return (
    <>
      <section className={styles.hero} data-hero="" suppressHydrationWarning>
        {/* Runs while the HTML is parsed, before the hero first paints: marks
            a full load (the headline reveal plays; a client navigation never
            runs this script). */}
        <script dangerouslySetInnerHTML={{ __html: EARLY }} />
        <div className={styles.gradient} aria-hidden="true" />
        <HeroMotion />
        <div className={styles.inner}>
          <OxideMark animated />
          <h1 className={styles.title}>
            {PAGES.home.h1.split(" ").map((word, i, words) => (
              <Fragment key={i}>
                <span
                  className={styles.word}
                  style={{ "--i": i } as CSSProperties}
                >
                  {word}
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className={styles.subheadline}>{copy.subheadline}</p>
          <div className={styles.buttons}>
            <Button href="/download" variant="primary" icon="download">
              {none ? copy.getOxide : copy.download}
            </Button>
            <Button
              href={GITHUB_REPO_URL}
              variant="ghost"
              icon="mark-github"
              event="github-cta"
            >
              {copy.github}
            </Button>
          </div>
          <p className={styles.platforms}>
            {platforms ? `${platforms} · ` : ""}
            {copy.platformSuffix}
          </p>
        </div>
      </section>
      <div className={styles.shot}>
        <Capture slot="hero" priority manifest={manifest} />
      </div>
    </>
  );
}
