"use client";

import { ChevronDown } from "lucide-react";
import type { StaffConnection } from "@/domain/staff";
import { useStaffConnection } from "./staffConnection";

/*
   The site at the start of the command bar ("Downtown ▾" in the WhatsMax writeup
   and the mockup): the CONTEXT layer, beside COMMAND rather than in a status row.
   From the Hub's principal only (integrations/staff.ts):
   - signed in: the site. The Hub sends its id but not its name yet, so it says
     "Site #1"; a name takes its place once the Hub sends one. One site per
     sign-in, so the ▾ menu has nothing to switch to yet.
   - healthy Odoo stays quiet (no status label); who is signed in is on the nav
     rail's staff circle.
   - signed out, Odoo unavailable and development sample data say so here,
     so sample data is never mistaken for Odoo.
   The Perspective switcher sits beside it (perspectiveSwitcher.tsx).
*/

const box =
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border bg-(--crm-panel) px-3 text-[12px] font-bold";

// The site's label. A name, when the Hub sends one, replaces the id.
function siteLabel(connection: Extract<StaffConnection, { state: "signedIn" }>) {
  return `Site #${connection.siteId}`;
}

export default function SiteControl() {
  const connection = useStaffConnection();
  if (!connection) return null;

  if (connection.state === "signedIn") {
    return (
      <button
        type="button"
        disabled
        aria-label={`Site: ${siteLabel(connection)}`}
        title="Your sign-in has one site, so there's nothing to switch to yet"
        // Phones: hidden, to leave room for search (like Companion's location label)
        className="hidden h-10 shrink-0 items-center gap-1.5 rounded-xl border border-(--crm-line) bg-(--crm-panel) px-3 text-[12px] font-bold text-(--crm-text) disabled:cursor-default sm:inline-flex"
      >
        {siteLabel(connection)}
        <ChevronDown size={14} aria-hidden="true" className="text-(--crm-muted)" />
      </button>
    );
  }

  if (connection.state === "development") {
    return (
      <span
        title="DreamOS is using development sample data, not Odoo"
        className={`${box} border-(--crm-warning)/50 text-(--crm-warning)`}
      >
        Sample data
      </span>
    );
  }

  if (connection.state === "unavailable") {
    return (
      <span role="status" title={connection.text} className={`${box} border-(--crm-danger)/50 text-(--crm-danger)`}>
        Odoo unavailable
      </span>
    );
  }

  return (
    <span className={`${box} border-(--crm-line) text-(--crm-muted)`}>Not signed in</span>
  );
}
