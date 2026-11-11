import octicons from "@primer/octicons";

const SIZE = 16;

/**
 * A GitHub Octicon (MIT), inlined as SVG when the page is rendered at build
 * time (Design system, Icon). This is a server component: the icon data never
 * reaches the browser as JavaScript. Icons are decorative; the control around
 * them carries the accessible name.
 */
export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const icon = octicons[name]?.heights[SIZE];
  if (!icon) throw new Error(`Icon: Octicons has no 16px "${name}"`);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${icon.width} ${SIZE}`}
      width={icon.width}
      height={SIZE}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      // Trusted markup from the Octicons package, read at build time.
      dangerouslySetInnerHTML={{ __html: icon.path }}
    />
  );
}
