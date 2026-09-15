/** Deterministic, evenly-spaced color per route index so each truck's path is visually distinct. */
export function routeColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1));
  return `hsl(${hue}, 72%, 45%)`;
}
