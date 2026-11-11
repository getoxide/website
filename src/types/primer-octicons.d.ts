// @primer/octicons ships no types. Only the fields the Icon component reads.
declare module "@primer/octicons" {
  type Octicon = {
    name: string;
    heights: Record<string, { width: number; path: string }>;
  };
  const octicons: Record<string, Octicon | undefined>;
  export default octicons;
}
