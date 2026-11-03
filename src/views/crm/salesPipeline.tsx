"use client";

import { useMemo, useState } from "react";
import type { CompanionContext } from "@/domain/companion";
import { NEXT_ACTION_LABELS } from "@/domain/followUp";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { organizeLeads, type LeadAttention, type LeadSort } from "@/domain/leadOrganization";
import type { CrmContext, Lead, LeadTag } from "@/domain/lead";
import { HubSignOutButton } from "@/views/shell/hubUnavailable";
import CrmSectionNav from "./crmSectionNav";
import { LeadList, LostLeads } from "./leadViews";
import LeadTray from "./leadTray";
import { PipelineBoard } from "@/templates/roster/components/pipeline/kanban";
import { PageHeader } from "@/templates/roster/components/ui/layout";
import { Switch } from "@/templates/roster/components/ui/form";
import { Button } from "@/templates/roster/components/ui/button";
import { Plus } from "lucide-react";
import NewLeadForm from "./newLeadForm";
import { toRosterPipeline } from "@/templates/roster/adapters/pipeline";
import "@/templates/roster/roster.css";

/*
   CRM / Sales (CRM screen C03), read-only. Product rules from Jodi's
   implementation handoff (9 Oct 2026, page 2): lead inbox + pipeline +
   contextual tray, filter by owner and program, Lost kept apart from the stages.
   List/Board and filters follow Companion's CrmWorkspace; the board layout
   now uses the migrated Roster PipelineBoard. Existing search, filters, list,
   lead tray and Companion context remain the orchestration layer. No stage writes.

   From Odoo (fromOdoo): the filter is "Tags", because Odoo's lead tags mix
   programs, sources and ages; and there's no Lost list, because crm_context
   leaves archived (lost) leads out.
*/

type View = "board" | "list";

const ALL = "";

// Hidden for now so the page matches Roster's pipeline: section nav, sign-out
// bar, search, attention buttons, filters and the Board/List switch.
// Set to true to bring them back; their state and logic are unchanged.
const SHOW_TOOLBAR = false;

const filterSelect =
  "h-9 rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 text-[12px] text-(--crm-text) focus:border-(--crm-muted) focus:outline-none";

// Every tag on the leads, once each, sorted by name
function tagsOnLeads(leads: Lead[]): LeadTag[] {
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
  fromOdoo,
  query = "",
  companion = null,
}: {
  context: CrmContext;
  showsSampleData: boolean;
  fromOdoo: boolean;
  query?: string;
  companion?: CompanionContext | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("board");
  const [ownerFilter, setOwnerFilter] = useState(ALL);
  const [tagFilter, setTagFilter] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState(ALL);
  const [sourceFilter, setSourceFilter] = useState(ALL);
  const [attention, setAttention] = useState<LeadAttention>("all");
  const [sort, setSort] = useState<LeadSort>("received");
  const [creating, setCreating] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);
  // The lead details panel beside the board, off by default (a switch in the header, for demos)
  const [showDetails, setShowDetails] = useState(false);
  // New leads are created only in real Odoo, never in the sample data
  const canCreate = fromOdoo && !showsSampleData;
  const shown = organizeLeads(context.leads, { owner: ownerFilter, tag: tagFilter, stage: stageFilter, source: sourceFilter, attention, sort });
  const openLeads = shown.filter((lead) => !lead.lostReason);
  const lostLeads = shown.filter((lead) => lead.lostReason);
  const boardData = toRosterPipeline({ ...context, leads: openLeads });
  const selected = shown.find((lead) => lead.id === selectedId) ?? null;
  const createdInView = createdLeadId !== null && shown.some((lead) => lead.id === createdLeadId);
  const railContext = useMemo<CompanionContext>(() => {
    if (!selected) return companion ?? {
      label: "Sales context · Odoo", intelTitle: "Loaded pipeline",
      intel: [{ label: "Leads returned", value: `${context.leads.length}${context.moreLeads ? "+" : ""}` }],
      guidance: "Select a lead to inspect recorded priority and next steps. Open its workspace to review a follow-up.",
      links: [{ id: "follow-ups", title: "Review the follow-up queue", href: "/crm/follow-ups" }],
      suggestions: [], receipts: [],
    };
    return {
      label: `Lead preview · ${selected.name}`, intelTitle: "Recorded lead context",
      intel: [{ label: "Stage", value: selected.stage }, { label: "Owner", value: selected.owner },
        ...(selected.evidence ? [{ label: "Priority", value: selected.evidence.priority }, { label: "Next step", value: NEXT_ACTION_LABELS[selected.evidence.nextAction] }] : [])],
      guidance: selected.evidence ? `${selected.evidence.priorityReason} Fixed Odoo evidence, not an AI prediction.` : "This read did not provide next-action evidence.",
      links: [{ id: selected.id, title: `Open ${selected.name}'s workspace`, detail: "Tasks, notes, activity and governed follow-up review", href: `/crm/leads/${selected.id}` }],
      suggestions: [], receipts: [],
    };
  }, [selected, companion, context.leads.length, context.moreLeads]);
  const filtered = !!(ownerFilter || tagFilter || stageFilter || sourceFilter || attention !== "all");
  function clearFilters() { setOwnerFilter(ALL); setTagFilter(ALL); setStageFilter(ALL); setSourceFilter(ALL); setAttention("all"); }

  return (
    <div className="crm-scope roster-scope">
      <DoForMeFocus focusKey={selected ? `sales:${selected.id}` : "sales"} context={railContext} />
      {showsSampleData && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample leads · Development preview, not connected to Odoo
        </p>
      )}
      {SHOW_TOOLBAR && fromOdoo && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[11px] text-(--crm-text-secondary)">
          <p>Leads from Odoo · Open a lead to review an internal follow-up</p>
          <HubSignOutButton />
        </div>
      )}

      <div className={`grid gap-6 ${showDetails ? "2xl:grid-cols-[minmax(0,1fr)_18rem]" : ""}`}>
        <section aria-label="Lead pipeline" className="min-w-0">
          {SHOW_TOOLBAR ? (
          <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight text-(--crm-text)">Sales</h1>
              <p className="mt-1 text-sm text-(--crm-text-secondary)">
                {openLeads.length} open {openLeads.length === 1 ? "lead" : "leads"}
                {context.moreLeads && " in this result · more available"}
                {!fromOdoo && ` · ${lostLeads.length} lost`}
              </p>
            </div>
            <CrmSectionNav />
          </header>
          ) : (
            <PageHeader
              title="Pipeline"
              description={`${context.moreLeads ? "At least " : ""}${openLeads.length} ${openLeads.length === 1 ? "lead" : "leads"} across ${boardData.stages.length} ${boardData.stages.length === 1 ? "stage" : "stages"}${fromOdoo ? " · from Odoo" : ` · ${lostLeads.length} lost`}`}
              actions={
                <>
                  <Switch checked={showDetails} onChange={setShowDetails} label="Lead details" />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canCreate}
                    title={canCreate ? undefined : "New leads can only be created when connected to Odoo"}
                    onClick={() => setCreating(true)}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                    New lead
                  </Button>
                </>
              }
            />
          )}
          {createdLeadId && (
            <p role="status" className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <span>
                Lead #{createdLeadId} created in Odoo, in the intake stage.
                {!createdInView && " It isn't in this view yet: refresh, or it may be outside the loaded result."}
              </span>
              <Link href={`/crm/leads/${createdLeadId}`} className="underline underline-offset-4">Open lead</Link>
              <button type="button" className="muted underline underline-offset-4" onClick={() => setCreatedLeadId(null)}>Dismiss</button>
            </p>
          )}
          <NewLeadForm
            open={creating}
            onClose={() => setCreating(false)}
            onCreated={(result) => {
              setCreating(false);
              setCreatedLeadId(result.leadId);
              setSelectedId(result.leadId);
              router.refresh();
            }}
          />

          {SHOW_TOOLBAR && (<>

          <form action="/crm" className="mb-4 flex flex-wrap gap-2" onSubmit={() => setSelectedId(null)}>
            <label className="min-w-48 flex-1">
              <span className="sr-only">Search lead or contact name</span>
              <input name="q" defaultValue={query} maxLength={100} placeholder="Search lead or contact name…" className={`${filterSelect} w-full`} />
            </label>
            <button className={filterSelect} type="submit">Search</button>
            {query && <Link href="/crm" className={`${filterSelect} inline-flex items-center`}>Clear search</Link>}
            <button type="button" className={filterSelect} onClick={() => router.refresh()}>Refresh</button>
          </form>
          {query && <p className="mb-3 text-[12px] text-(--crm-text-secondary)">Results for “{query}” · searched by lead/contact name{fromOdoo ? " in Odoo" : " in sample data"}.</p>}

          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Lead attention">
            {([['all', 'All leads'], ['overdue', 'Overdue tasks'], ['today', 'Due today'], ['missing', 'Needs follow-up']] as const).map(([value, label]) => (
              <button type="button" key={value} aria-pressed={attention === value} onClick={() => setAttention(value)} className={`${filterSelect} ${attention === value ? "border-(--crm-brand)" : ""}`}>{label}</button>
            ))}
            <Link href="/crm/follow-ups" className={`${filterSelect} inline-flex items-center`}>Open task queue →</Link>
          </div>

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

            <label className="text-[12px] text-(--crm-text-secondary)">Stage <select aria-label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className={filterSelect}><option value="">All stages</option>{context.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
            <label className="text-[12px] text-(--crm-text-secondary)">Source <select aria-label="Source" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={filterSelect}><option value="">All sources</option>{[...new Set(context.leads.map((lead) => lead.source))].filter(Boolean).sort().map((source) => <option key={source}>{source}</option>)}</select></label>
            <label className="text-[12px] text-(--crm-text-secondary)">Sort <select aria-label="Sort leads" value={sort} onChange={(e) => setSort(e.target.value as LeadSort)} className={filterSelect}><option value="received">Source order</option><option value="priority">Recorded priority</option><option value="name">Name</option></select></label>
            {filtered && <button type="button" className={filterSelect} onClick={clearFilters}>Reset filters</button>}
            <label className="flex items-center gap-2 text-[12px] text-(--crm-text-secondary)">
              Tags
              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className={filterSelect}
              >
                <option value={ALL}>All tags</option>
                {tagsOnLeads(context.leads).map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
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

          <p role="status" className="mb-3 text-[11px] text-(--crm-muted)">{shown.length} matching {shown.length === 1 ? "lead" : "leads"} in the loaded result. Attention filters require recorded Hub evidence.</p>
          </>)}
          {openLeads.length === 0 && <p className="mb-4 rounded-lg border border-dashed border-(--crm-line) p-5 text-sm text-(--crm-text-secondary)">No open leads match. Adjust the search or reset the filters.</p>}
          {view === "board" ? (
            <PipelineBoard
              data={boardData}
              showHeader={false}
              selection={{ id: selected?.id ?? null, onSelect: setSelectedId }}
            />
          ) : (
            <LeadList leads={openLeads} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          {fromOdoo ? (
            <p className="mt-6 text-[11px] text-(--crm-muted)">
              Lost leads are archived in Odoo and aren&apos;t listed here.
            </p>
          ) : (
            <LostLeads leads={lostLeads} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          {context.moreLeads && (
            <p className="mt-4 text-[11px] text-(--crm-muted)">
              This read is capped. Counts and filters describe only the loaded leads; more may be available.
            </p>
          )}
        </section>

        {showDetails && <LeadTray lead={selected} allowTrialBooking={fromOdoo && !showsSampleData} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}
