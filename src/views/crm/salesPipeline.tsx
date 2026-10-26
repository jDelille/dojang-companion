"use client";

import { useState } from "react";
import type { CrmContext, Lead, LeadTag } from "@/domain/lead";
import { LeadBoard, LeadList, LostLeads } from "./leadViews";
import LeadTray from "./leadTray";

/*
   CRM / Sales (CRM screen C03), read-only development slice. Product rules from
   Jodi's implementation handoff (9 Oct 2026, page 2): lead inbox + pipeline +
   contextual tray, filter by owner and program, Lost kept apart from the stages.
   List/Board and filters follow Companion's CrmWorkspace; the board layout
   follows Roster's kanban. No dragging or other writes yet.
*/

type View = "board" | "list";

const ALL = "";

const filterSelect =
  "h-9 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 text-[12px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none";

// Every program tag on the leads, once each, sorted by name
function programsOf(leads: Lead[]): LeadTag[] {
  const byId = new Map<string, LeadTag>();
  for (const lead of leads) {
    for (const tag of lead.tags) byId.set(tag.id, tag);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// Every owner name on the leads, once each, sorted
function ownersOf(leads: Lead[]): string[] {
  return [...new Set(leads.map((lead) => lead.owner))].sort();
}

export default function SalesPipeline({
  context,
  showsSampleData,
}: {
  context: CrmContext;
  showsSampleData: boolean;
}) {
  const [view, setView] = useState<View>("board");
  const [ownerFilter, setOwnerFilter] = useState(ALL);
  const [programFilter, setProgramFilter] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function matchesFilters(lead: Lead) {
    if (ownerFilter !== ALL && lead.owner !== ownerFilter) return false;
    if (programFilter !== ALL && !lead.tags.some((tag) => tag.id === programFilter)) return false;
    return true;
  }

  const shown = context.leads.filter(matchesFilters);
  const openLeads = shown.filter((lead) => !lead.lostReason);
  const lostLeads = shown.filter((lead) => lead.lostReason);
  const selected = context.leads.find((lead) => lead.id === selectedId) ?? null;

  return (
    <div className="crm-scope overflow-hidden rounded-2xl border border-(--crm-line)">
      {showsSampleData && (
        <p className="border-b border-(--crm-line) px-5 py-3 text-[11px] text-(--crm-text-secondary) sm:px-6">
          Sample leads · Development preview, not connected to Odoo
        </p>
      )}

      <div className="grid 2xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Lead pipeline" className="min-w-0 p-5 sm:p-6">
          <header className="mb-5">
            <h1 className="text-xl font-bold leading-tight text-(--crm-text)">Sales</h1>
            <p className="mt-1 text-sm text-(--crm-text-secondary)">
              {openLeads.length} open {openLeads.length === 1 ? "lead" : "leads"} · {lostLeads.length} lost
            </p>
          </header>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-[12px] text-(--crm-text-secondary)">
              Owner
              <select
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                className={filterSelect}
              >
                <option value={ALL}>All owners</option>
                {ownersOf(context.leads).map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[12px] text-(--crm-text-secondary)">
              Program
              <select
                value={programFilter}
                onChange={(event) => setProgramFilter(event.target.value)}
                className={filterSelect}
              >
                <option value={ALL}>All programs</option>
                {programsOf(context.leads).map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>

            <div
              role="group"
              aria-label="Pipeline view"
              className="ml-auto flex rounded-lg border border-(--crm-line) p-0.5"
            >
              {(["board", "list"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors ${
                    view === option
                      ? "bg-(--crm-interactive) text-(--crm-text)"
                      : "text-(--crm-muted) hover:text-(--crm-text)"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {view === "board" ? (
            <LeadBoard
              stages={context.stages}
              leads={openLeads}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <LeadList leads={openLeads} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          <LostLeads leads={lostLeads} selectedId={selectedId} onSelect={setSelectedId} />

          {context.moreLeads && (
            <p className="mt-4 text-[11px] text-(--crm-muted)">
              Showing the latest 100 leads only.
            </p>
          )}
        </section>

        <LeadTray lead={selected} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}
