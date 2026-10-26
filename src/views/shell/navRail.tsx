"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { all_routes } from "@/routes/all_routes";
import { dojangMenu, type SidebarLeaf } from "@/utils/json/sidebarMenu";

/*
   The narrow navigation rail on the far left of the mockup
   (Desktop/vercel-design-1.png): the Dojang mark, one tile per section (two
   letters over the name), and the staff member at the bottom. Only the sections
   that exist are listed (the same dojangMenu as the template sidebar).
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

export default function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="row-span-3 border-r border-(--crm-line) lg:row-span-1"
    >
      <div className="sticky top-0 flex h-dvh flex-col items-center gap-4 py-4 lg:h-full">
        {/* Dojang mark: the black square "D" from Companion's sidebar */}
        <Link
          href="/"
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

        {/* No staff sign-in yet (it will be the Odoo login through the Hub) */}
        <div
          role="img"
          aria-label="Staff · Not signed in · Development"
          title="Staff · Not signed in · Development"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-raised) text-(--crm-muted)"
        >
          <User size={16} aria-hidden="true" />
        </div>
      </div>
    </nav>
  );
}
