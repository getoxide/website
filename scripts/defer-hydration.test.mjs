import { describe, expect, it } from "vitest";
import {
  deferClientScripts,
  inlineSuspenseTemplates,
  loader,
  MAX_WAIT,
  parsesClientRuntime,
} from "./defer-hydration.mjs";

const PAGE = `<!DOCTYPE html><html><head>
<link rel="preload" href="/_next/static/media/inter.woff2" as="font" crossorigin=""/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/page.js"/>
<link rel="stylesheet" href="/_next/static/chunks/app.css"/>
<script src="/_next/static/chunks/framework.js" async=""></script>
<script src="/_next/static/chunks/page.js" async=""></script>
<script src="/_next/static/chunks/legacy.js" noModule=""></script>
</head><body>
<main id="main"><h1>The complete desktop app for agentic coding.</h1></main>
<script>self.__next_f=self.__next_f||[];self.__next_f.push([1,"data"])</script>
<script type="application/ld+json">{"@type":"WebPage"}</script>
<script async="" src="https://gc.zgo.at/count.js" data-goatcounter="https://oxide.goatcounter.com/count"></script>
</body></html>`;

describe("deferClientScripts", () => {
  it("removes the Next scripts from the parsing document", () => {
    const html = deferClientScripts(PAGE);
    expect(parsesClientRuntime(html)).toBe(false);
    expect(html).not.toContain('src="/_next/static/chunks/framework.js"');
    expect(html).not.toContain('src="/_next/static/chunks/page.js"');
  });

  it("re-inserts them after load, in order, without async reordering", () => {
    const html = deferClientScripts(PAGE);
    expect(html).toContain(
      loader([
        "/_next/static/chunks/framework.js",
        "/_next/static/chunks/page.js",
      ]),
    );
    // In insertion order: framework before page.
    expect(html.indexOf("framework.js")).toBeLessThan(html.indexOf("page.js"));
    expect(html).toContain("e.async=false");
    expect(html).toContain('addEventListener("load",after,{once:true})');
    // After the content: it never delays the first paint.
    expect(html.indexOf("<h1>")).toBeLessThan(html.indexOf("addEventListener"));
  });

  it("drops the script preload for the deferred chunks", () => {
    const html = deferClientScripts(PAGE);
    expect(html).not.toContain('as="script"');
    // The font preload and the stylesheet are not script preloads.
    expect(html).toContain("inter.woff2");
    expect(html).toContain('href="/_next/static/chunks/app.css"');
  });

  it("keeps the noModule legacy chunk where it is", () => {
    const html = deferClientScripts(PAGE);
    expect(html).toMatch(/<script src="\/_next\/static\/chunks\/legacy\.js"/);
    expect(html).toContain("noModule");
  });

  it("keeps inline scripts, JSON-LD and analytics", () => {
    const html = deferClientScripts(PAGE);
    expect(html).toContain("self.__next_f.push");
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("data-goatcounter=");
  });

  it("is a no-op when the page carries no client runtime", () => {
    const plain = "<!DOCTYPE html><html><body><h1>Changelog</h1></body></html>";
    expect(deferClientScripts(plain)).toBe(plain);
  });

  it("is idempotent", () => {
    const once = deferClientScripts(PAGE);
    expect(deferClientScripts(once)).toBe(once);
  });
});

describe("loader", () => {
  const script = loader(["/_next/a.js"]);

  it("starts waiting at once when the document is already complete", () => {
    expect(script).toContain('if(document.readyState==="complete")after();');
  });

  it("waits for the finite animations (the headline reveal), not the endless ones", () => {
    expect(script).toContain("document.getAnimations");
    expect(script).toContain("t.iterations!==Infinity");
    expect(script).toContain("x.finished");
  });

  it("then waits for the next frame, and never longer than MAX_WAIT", () => {
    expect(script).toContain(
      "requestAnimationFrame(function(){setTimeout(go,0)})",
    );
    expect(script).toContain(`setTimeout(paint,${MAX_WAIT})`);
    expect(MAX_WAIT).toBeLessThanOrEqual(3000);
  });

  it("boots the runtime exactly once", () => {
    expect(script).toContain("if(d)return;d=true;");
  });

  it("runs the sources it is given, in order, when executed", () => {
    const added = [];
    const listeners = {};
    const env = {
      document: {
        readyState: "loading",
        getAnimations: () => [],
        createElement: () => ({}),
        body: { appendChild: (e) => added.push(e.src) },
      },
      addEventListener: (type, fn) => (listeners[type] = fn),
      requestAnimationFrame: (fn) => fn(),
      setTimeout: (fn) => (fn(), 0),
    };
    const code = loader(["/_next/a.js", "/_next/b.js"]).replace(
      /^<script>|<\/script>$/g,
      "",
    );
    new Function(...Object.keys(env), code)(...Object.values(env));
    listeners.load();
    return Promise.resolve().then(() => {
      expect(added).toEqual(["/_next/a.js", "/_next/b.js"]);
    });
  });
});

describe("inlineSuspenseTemplates", () => {
  const STREAMED = `<!DOCTYPE html><html><body><div class="shot"><!--$?--><template id="B:0"></template><!--/$--></div><div hidden id="S:0"><figure><div>nested</div></figure></div><script>$RC=function(b,c){};$RC("B:0","S:0")</script></body></html>`;

  it("inlines resolved Suspense templates with nested divs and drops $RC", () => {
    const html = inlineSuspenseTemplates(STREAMED);
    expect(html).toContain(
      '<div class="shot"><!--$--><figure><div>nested</div></figure><!--/$--></div>',
    );
    expect(html).not.toContain('id="S:0"');
    expect(html).not.toContain('id="B:0"');
    expect(html).not.toContain("$RC(");
  });

  it("is a no-op when there are no Suspense templates and is idempotent", () => {
    expect(inlineSuspenseTemplates(PAGE)).toBe(PAGE);
    const once = inlineSuspenseTemplates(STREAMED);
    expect(inlineSuspenseTemplates(once)).toBe(once);
  });
});
