import type { Viewport } from "next";
import localFont from "next/font/local";
import { COPY } from "@/content/copy";
import { GOATCOUNTER_ENDPOINT, GOATCOUNTER_SCRIPT } from "@/lib/measurement";
import "../../content/oxide/brand/oxide-tokens.css";
import "../styles/tokens.css";
import "./globals.css";

// Budgets, Fonts: three variable Latin-subset WOFF2 files, self-hosted, with
// next/font's metric-matched fallback. Only Space Grotesk and Inter preload.
const heading = localFont({
  src: "../fonts/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--site-face-heading",
  preload: true,
});
const body = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--site-face-body",
  preload: true,
});
const code = localFont({
  src: "../fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  display: "swap",
  variable: "--site-face-code",
  preload: false,
});

export const viewport: Viewport = { colorScheme: "dark" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${code.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          {COPY.skipLink}
        </a>
        {/* Each page wraps itself in SiteFrame: header, main, footer. */}
        {children}
        {/* Measurement plan (#16): the only third-party script, async. */}
        <script
          async
          src={GOATCOUNTER_SCRIPT}
          data-goatcounter={GOATCOUNTER_ENDPOINT}
        />
      </body>
    </html>
  );
}
