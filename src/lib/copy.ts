/**
 * The inline script the Code block ships: it adds the Copy button after the
 * page is parsed, so the server HTML carries no dead control and no client
 * component (Design system, Code block; issue #32). Reading pages have no
 * hydration at all, so this is the only thing that makes Copy work there. It
 * is idempotent: every code block renders it, and the first run marks the
 * blocks it has handled. Plain ES5, kept tiny: it ships in the HTML.
 */
export const COPY_SCRIPT = `(function(){function run(){for(var b=document.querySelectorAll("[data-copy]"),i=0;i<b.length;i++){var el=b[i];if(el.getAttribute("data-copy-ready"))continue;el.setAttribute("data-copy-ready","");var pre=el.querySelector("pre");if(!pre||!navigator.clipboard)continue;var t=pre.textContent;if(t.slice(-1)==="\\n")t=t.slice(0,-1);var btn=document.createElement("button");btn.type="button";btn.className=el.getAttribute("data-copy-class")||"";btn.setAttribute("aria-live","polite");btn.textContent="Copy";btn.addEventListener("click",function(){navigator.clipboard.writeText(t).then(function(){btn.textContent="Copied";setTimeout(function(){btn.textContent="Copy"},2000)},function(){})});el.appendChild(btn)}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run()})();`;
