"use client";

import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";

/** Resolves once the browser is idle, never later than `timeout` ms. */
const whenIdle = (timeout: number) =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
    } else if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout });
    } else {
      setTimeout(resolve, 200);
    }
  });

/**
 * The preview's client code loads in its own chunk and hydrates on its own,
 * after the page's first idle moment, so its hydration is a separate task
 * from the framework's boot and the page's total blocking time stays inside
 * its budget (Budgets, Core Web Vitals). The server still renders the whole
 * preview, so the page is complete without JavaScript.
 */
const AppPreviewApp = lazy(async () => {
  await whenIdle(1500);
  const { AppPreviewApp } = await import("./AppPreviewApp");
  return { default: AppPreviewApp };
});

export function AppPreviewLazy(props: ComponentProps<typeof AppPreviewApp>) {
  return (
    <Suspense fallback={null}>
      <AppPreviewApp {...props} />
    </Suspense>
  );
}
