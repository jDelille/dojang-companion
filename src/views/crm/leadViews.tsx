"use client";

import type { CrmStage, Lead } from "@/domain/lead";

/*
   The Sales pipeline's two views of the same leads, plus the separate Lost list.
   Board columns come from the context's stages, in order (never hardcoded ids);
   a lead whose stage isn't in that list goes in "Other / unassigned", as in
   Companion's LeadPipeline. Read-only: picking a lead only selects it.
*/

const OTHER_COLUMN: CrmStage = { id: "other", name: "Other / unassigned" };

const sectionLabel =
  "block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

// "Ava Martinez" -> "AM"
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

// "Pee Wee, Website", or "Not recorded" when the lead has no tags. Odoo's lead
// tags mix programs, sources and ages, so they're shown as tags, not as a program.
export function tagsOf(lead: Lead) {
  if (lead.tags.length === 0) return "Not recorded";
  return lead.tags.map((tag) => tag.name).join(", ");
}

type SelectProps = {
  selectedId: string | null;
  onSelect: (leadId: string) => void;
};

function LeadCard({ lead, selectedId, onSelect }: { lead: Lead } & SelectProps) {
  const isSelected = lead.id === selectedId;
  return (
    <button
      type="button"
      onClick={() => onSelect(lead.id)}
      aria-pressed={isSelected}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-(--crm-text-secondary) bg-(--crm-interactive)"
          : "border-(--crm-line) bg-(--crm-raised) hover:border-(--crm-muted)"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-canvas) font-(family-name:--crm-font-label) text-[9px] font-bold text-(--crm-text)"
        >
          {initials(lead.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-(--crm-text)">
            {lead.name}
          </span>
          <span className="block truncate text-[11px] text-(--crm-muted)">{lead.contact}</span>
        </span>
      </span>
      <span className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
        <span className="truncate text-(--crm-text-secondary)">{tagsOf(lead)}</span>
        <span className="shrink-0 text-(--crm-muted)">{lead.owner}</span>
      </span>
    </button>
  );
}

export function LeadBoard({
  stages,
  leads,
  selectedId,
  onSelect,
}: { stages: CrmStage[]; leads: Lead[] } & SelectProps) {
  const isKnownStage = (lead: Lead) => stages.some((stage) => stage.id === lead.stageId);
  const columns = leads.some((lead) => !isKnownStage(lead)) ? [...stages, OTHER_COLUMN] : stages;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((column) => {
        const rows =
          column.id === OTHER_COLUMN.id
            ? leads.filter((lead) => !isKnownStage(lead))
            : leads.filter((lead) => lead.stageId === column.id);
        return (
          <section
            key={column.id}
            aria-label={`Stage ${column.name}`}
            className="flex w-56 shrink-0 flex-col gap-2 rounded-xl border border-(--crm-line) bg-(--crm-panel) p-3"
          >
            <header className="mb-1 flex items-center justify-between px-0.5">
              <h3 className="text-[12px] font-bold text-(--crm-text)">{column.name}</h3>
              <span className="text-[11px] text-(--crm-muted)">{rows.length}</span>
            </header>
            {rows.length === 0 ? (
              <p className="px-0.5 py-2 text-[11px] text-(--crm-muted)">No matching leads</p>
            ) : (
              rows.map((lead) => (
                <LeadCard key={lead.id} lead={lead} selectedId={selectedId} onSelect={onSelect} />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

export function LeadList({ leads, selectedId, onSelect }: { leads: Lead[] } & SelectProps) {
  if (leads.length === 0) {
    return <p className="py-6 text-center text-sm text-(--crm-muted)">No matching leads.</p>;
  }

  const headerCell = `${sectionLabel} px-3 py-2.5 text-left`;
  return (
    <div className="overflow-x-auto rounded-xl border border-(--crm-line)">
      <table className="w-full min-w-[40rem] text-[12px]">
        <thead className="bg-(--crm-panel)">
          <tr>
            <th className={headerCell}>Lead</th>
            <th className={headerCell}>Stage</th>
            <th className={headerCell}>Tags</th>
            <th className={headerCell}>Owner</th>
            <th className={headerCell}>Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isSelected = lead.id === selectedId;
            return (
              <tr
                key={lead.id}
                className={`border-t border-(--crm-line) ${isSelected ? "bg-(--crm-interactive)" : ""}`}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelect(lead.id)}
                    aria-pressed={isSelected}
                    className="text-left"
                  >
                    <span className="block font-semibold text-(--crm-text) hover:underline">
                      {lead.name}
                    </span>
                    <span className="block text-[11px] text-(--crm-muted)">{lead.contact}</span>
                  </button>
                </td>
                <td className="px-3 py-2.5 text-(--crm-text)">{lead.stage}</td>
                <td className="px-3 py-2.5 text-(--crm-text-secondary)">{tagsOf(lead)}</td>
                <td className="px-3 py-2.5 text-(--crm-text-secondary)">{lead.owner}</td>
                <td className="px-3 py-2.5 text-(--crm-text-secondary)">{lead.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Lost is an outcome, not a column (Jodi's C03: "Lost is a separate terminal outcome")
export function LostLeads({ leads, selectedId, onSelect }: { leads: Lead[] } & SelectProps) {
  return (
    <section aria-label="Lost leads" className="mt-6">
      <span className={`${sectionLabel} mb-2`}>Lost · {leads.length}</span>
      {leads.length === 0 ? (
        <p className="text-[12px] text-(--crm-muted)">No matching lost leads.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {leads.map((lead) => {
            const isSelected = lead.id === selectedId;
            return (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => onSelect(lead.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors ${
                    isSelected
                      ? "border-(--crm-line) bg-(--crm-interactive)"
                      : "border-transparent hover:bg-(--crm-raised)"
                  }`}
                >
                  <span className="font-semibold text-(--crm-text-secondary)">{lead.name}</span>
                  <span className="text-(--crm-muted)">
                    {lead.lostReason} · lost at {lead.stage} · {lead.owner}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
