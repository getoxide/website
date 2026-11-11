import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

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
  children,
}: {
  href: string;
  variant: ButtonVariant;
  /** An Octicon name, shown 8px before the label. */
  icon?: string;
  /** The link points at the page being viewed. */
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`${styles.button} ${styles[variant]}`}
      aria-current={current ? "page" : undefined}
    >
      {icon ? <Icon name={icon} /> : null}
      {children}
    </a>
  );
}
