"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { homeRoute } from "@/domain/perspective";
import { roleLabel, type StaffConnection } from "@/domain/staff";
import { all_routes } from "@/routes/all_routes";
import { dojangMenu, type SidebarLeaf } from "@/utils/json/sidebarMenu";
import { useCurrentPerspective } from "./currentPerspective";
import { useStaffConnection } from "./staffConnection";

/*
   The narrow navigation rail on the far left of the mockup
   (Desktop/vercel-design-1.png): the Dojang mark, one tile per section (two
   letters over the name), and the staff member at the bottom. Only the sections
   that exist are listed (the same dojangMenu as the template sidebar).

   The Dojang mark is Home: the chosen Perspective's default dashboard
   (domain/perspective.ts), or the general portal's when none is chosen.
*/

type NavLink = { label: string; href: string; matchSubpaths: boolean };

// Every page link in the Dojang menu, in order
const LINKS: NavLink[] = [];
for (const section of dojangMenu) {
  for (const item of section.items) {
    if ("children" in item) continue;
    const leaf: SidebarLeaf = item;
    if (!leaf.routeKey) continue;
    LINKS.push({ label: leaf.label, href: all_routes[leaf.routeKey], matchSubpaths: !!leaf.matchSubpaths });
  }
}

function isActive(link: NavLink, pathname: string) {
  return pathname === link.href || (link.matchSubpaths && pathname.startsWith(`${link.href}/`));
}

// "Jamie Rivera" -> "JR"
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// What the staff circle at the bottom says (its tooltip and screen-reader label)
function staffLabel(connection: StaffConnection | null) {
  if (!connection) return "Staff";
  if (connection.state === "signedIn") return `${connection.name} · ${roleLabel(connection.role)}`;
  if (connection.state === "signedOut") return "Not signed in";
  if (connection.state === "development") return "Development · sample data, not Odoo";
  return `Odoo unavailable · ${connection.text}`;
}

export default function NavRail() {
  const pathname = usePathname();
  const connection = useStaffConnection();
  const perspective = useCurrentPerspective();
  const label = staffLabel(connection);

  return (
    <nav
      aria-label="Primary navigation"
      className="h-full border-r border-(--crm-line)"
    >
      <div className="flex h-full flex-col items-center gap-4 py-4">
        {/* Dojang mark: the black square "D" from Companion's sidebar */}
        <Link
          href={homeRoute(perspective)}
          aria-label="Dojang home"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-(--crm-line) bg-black text-[17px] font-black text-white"
        >
          D
        </Link>

        <ul className="flex w-full flex-1 flex-col items-center gap-1.5 overflow-y-auto px-2">
          {LINKS.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.label} className="w-full">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full flex-col items-center gap-0.5 rounded-xl border-l-2 py-2 transition-colors ${
                    active
                      ? "border-(--crm-nav-active) bg-(--crm-interactive) text-(--crm-nav-active)"
                      : "border-transparent text-(--crm-muted) hover:bg-(--crm-raised) hover:text-(--crm-text)"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="font-(family-name:--crm-font-label) text-[12px] font-bold tracking-wide"
                  >
                    {item.label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={`text-[10px] ${active ? "" : "text-(--crm-text-secondary)"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* The signed-in staff member (Odoo login through the Hub), or why there's none */}
        <div
          role="img"
          aria-label={label}
          title={label}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-raised) text-(--crm-muted)"
        >
          {connection?.state === "signedIn" && initials(connection.name) ? (
            <span className="font-(family-name:--crm-font-label) text-[11px] font-bold text-(--crm-text)">
              {initials(connection.name)}
            </span>
          ) : (
            <User size={16} aria-hidden="true" />
          )}
        </div>
      </div>
    </nav>
  );
}

// Phones (below 600px): the same sections as a bar along the bottom, like
// Companion's bottom nav. Scrolls sideways when they don't all fit.
export function BottomNav() {
  const pathname = usePathname();
  const perspective = useCurrentPerspective();

  return (
    <nav aria-label="Primary navigation" className="border-t border-(--crm-line) bg-(--crm-canvas) pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch gap-1 overflow-x-auto px-2 py-1.5">
        <li className="shrink-0">
          <Link
            href={homeRoute(perspective)}
            aria-label="Dojang home"
            className="grid h-full min-h-12 w-12 place-items-center rounded-xl text-[15px] font-black text-white"
          >
            D
          </Link>
        </li>
        {LINKS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-xl border-t-2 px-2 transition-colors ${
                  active
                    ? "border-(--crm-nav-active) bg-(--crm-interactive) text-(--crm-nav-active)"
                    : "border-transparent text-(--crm-muted) hover:bg-(--crm-raised) hover:text-(--crm-text)"
                }`}
              >
                <span aria-hidden="true" className="font-(family-name:--crm-font-label) text-[11px] font-bold tracking-wide">
                  {item.label.slice(0, 2).toUpperCase()}
                </span>
                <span className={`text-[10px] ${active ? "" : "text-(--crm-text-secondary)"}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
