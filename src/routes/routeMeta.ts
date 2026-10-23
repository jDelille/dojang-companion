import { all_routes } from "./all_routes";
import { base_path } from "../environment";
import {
  sidebarMenu,
  type SidebarLeaf,
  type SidebarSection,
  type SidebarSubmenu,
} from "../utils/json/sidebarMenu";

export type RouteMeta = {
  /** The page's own name, e.g. "Membership Plans". */
  label: string;
  /** Ancestor labels ending with the page itself, e.g. ["Members", "Membership Plans"]. */
  trail: string[];
};

const isLeaf = (item: SidebarLeaf | SidebarSubmenu): item is SidebarLeaf =>
  !("children" in item);

/*
   Walks the sidebar tree and records a trail for every routed leaf.

   Derived rather than hand-written: the sidebar already names every page and
   groups it, so a second literal map would be one more thing to keep in sync
   and would drift the first time a menu label changed.
*/
function collect(
  items: (SidebarLeaf | SidebarSubmenu)[],
  ancestors: string[],
  out: Record<string, RouteMeta>,
) {
  for (const item of items) {
    if (!isLeaf(item)) {
      collect(item.children, [...ancestors, item.label], out);
      continue;
    }

    if (!item.routeKey) continue;
    const path = all_routes[item.routeKey];
    if (!path || out[path]) continue; // first win keeps the shallowest trail

    /*
       "Members > Members" reads as a mistake rather than a hierarchy, so drop
       an ancestor that only repeats the page's own name.
    */
    const parents =
      ancestors.at(-1) === item.label ? ancestors.slice(0, -1) : ancestors;
    out[path] = { label: item.label, trail: [...parents, item.label] };
  }
}

function build(sections: SidebarSection[]): Record<string, RouteMeta> {
  const out: Record<string, RouteMeta> = {};
  for (const section of sections) {
    collect(section.items, [], out);
  }
  return out;
}

export const routeMeta: Record<string, RouteMeta> = build(sidebarMenu);

/** Turns "/membership-plans" into "Membership Plans" for unlisted routes. */
function titleiseFromPath(pathname: string): string {
  const slug = pathname.split("/").filter(Boolean).pop();
  if (!slug) return "Dashboard";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/*
   Auth, error and detail pages are deliberately absent from the sidebar, so a
   miss here is normal rather than an error — fall back to the slug instead of
   rendering an empty breadcrumb.
*/
export function stripBase(pathname: string): string {
  const base = base_path.replace(/\/+$/, "");
  if (!base || !pathname.startsWith(base)) return pathname;
  return pathname.slice(base.length) || "/";
}

export function getRouteMeta(pathname: string): RouteMeta {
  const path = stripBase(pathname);
  const known = routeMeta[path];
  if (known) return known;
  const label = titleiseFromPath(path);
  return { label, trail: [label] };
}
