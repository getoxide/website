"use client";

import { lazy, Suspense } from "react";
import type { AppPreviewAppProps } from "./AppPreviewApp";

/**
 * Splits `AppPreviewApp` into its own async chunk and defers client hydration
 * to a separate macrotask (`setTimeout(..., 0)`) so it never stacks on top of
 * the initial Next.js/React root hydration task (Budgets, Core Web Vitals TBT).
 * During static export (`typeof window === "undefined"`), the component resolves
 * during SSR and `scripts/defer-hydration.mjs` inlines the resolved Suspense
 * content into place so the preview renders with zero JS and zero CLS.
 */
const LazyAppPreview = lazy(() =>
  typeof window === "undefined"
    ? import("./AppPreviewApp").then((m) => ({ default: m.AppPreviewApp }))
    : new Promise<{ default: typeof import("./AppPreviewApp").AppPreviewApp }>(
        (resolve) => {
          setTimeout(() => {
            void import("./AppPreviewApp").then((m) =>
              resolve({ default: m.AppPreviewApp }),
            );
          }, 0);
        },
      ),
);

export function AppPreviewLazy(props: AppPreviewAppProps) {
  return (
    <Suspense fallback={null}>
      <LazyAppPreview {...props} />
    </Suspense>
  );
}
