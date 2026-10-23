import { routeMeta } from "./routeMeta";

export type SearchEntry = {
  label: string;
  /** Where the page sits, e.g. "Members › Membership Plans". */
  sub: string;
  path: string;
};

/*
   Search index for the header's global search.

   Derived from routeMeta — which is itself derived from the sidebar — so the
   results, the nav and the breadcrumb all describe the same pages and cannot
   drift apart. The template hand-maintained a separate list in script.js.
*/
export const searchIndex: SearchEntry[] = Object.entries(routeMeta)
  .map(([path, meta]) => ({
    label: meta.label,
    // A top-level page has no ancestors; show its own path rather than
    // mislabelling it with an unrelated section name.
    sub: meta.trail.slice(0, -1).join(" › ") || path,
    path,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

/** Case-insensitive label match, capped so the panel stays a reasonable size. */
export function searchPages(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex
    .filter((entry) => entry.label.toLowerCase().includes(q))
    .slice(0, limit);
}
