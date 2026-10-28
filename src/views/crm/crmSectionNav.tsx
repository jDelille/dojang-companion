"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
   The Sales area's two views: the lead pipeline (/crm) and the follow-up queue
   (/crm/follow-ups). Same look as the pipeline's Board/List switch.
*/

const VIEWS = [
  { href: "/crm", label: "Pipeline" },
  { href: "/crm/follow-ups", label: "Follow-ups" },
];

export default function CrmSectionNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sales views" className="flex w-fit rounded-lg border border-(--crm-line) p-0.5">
      {VIEWS.map((view) => {
        const active = pathname === view.href;
        return (
          <Link
            key={view.href}
            href={view.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              active ? "bg-(--crm-interactive) text-(--crm-text)" : "text-(--crm-muted) hover:text-(--crm-text)"
            }`}
          >
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}
