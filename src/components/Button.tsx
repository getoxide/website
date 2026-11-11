import type { ReactNode } from "react";
import type { Os } from "@/lib/os";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

/** The click events the Measurement plan (#16) freezes. */
export type ClickEvent =
  "download-macos-arm" | "download-windows" | "download-linux" | "github-cta";

export type ButtonVariant = "primary" | "ghost" | "nav";

/**
 * A link styled as a button (Design system, Button): `primary` and `ghost`
 * for calls to action, `nav` for the header pill. Always an `<a>`, so it works
 * without JavaScript.
 */
export function Button({
  href,
  variant,
  icon,
  current = false,
  platform,
  describedBy,
  event,
  children,
}: {
  href: string;
  variant: ButtonVariant;
  /** An Octicon name, shown 8px before the label. */
  icon?: string;
  /** The link points at the page being viewed. */
  current?: boolean;
  /**
   * One of the Download block's platform pair. Its look follows the platform
   * the inline script detects (`html[data-os]`); `variant` is the look
   * without JavaScript.
   */
  platform?: Exclude<Os, "other">;
  /** Id of the element that describes the link (a sublabel). */
  describedBy?: string;
  /**
   * GoatCounter click event (Measurement plan #16): rendered as
   * `data-goatcounter-click`, inert until the counter script loads.
   */
  event?: ClickEvent;
  children: ReactNode;
}) {
  const classes = [
    styles.button,
    styles[variant],
    platform ? styles[platform] : null,
  ];
  return (
    <a
      href={href}
      className={classes.filter(Boolean).join(" ")}
      aria-current={current ? "page" : undefined}
      aria-describedby={describedBy}
      data-goatcounter-click={event}
    >
      {icon ? <Icon name={icon} /> : null}
      {children}
    </a>
  );
}
