"use client";

import Link from "next/link";
import type { Lead } from "@/domain/lead";
import { tagsOf } from "./leadViews";
import { NEXT_ACTION_LABELS } from "@/domain/followUp";

/*
   The contextual tray beside the pipeline (Jodi's C03: "Lead inbox + pipeline +
   contextual companion tray"). For now it shows the selected lead from the list
   data only; "Open lead" goes to the full record (C04). The actions below
   (book a trial, next action, stage proposal) stay off until writes exist.
*/

const NOT_CONNECTED = "Not connected yet";
const NOT_RECORDED = "Not recorded";

const actionButton =
  "inline-flex h-8 items-center rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) disabled:opacity-60 hover:border-(--crm-muted)";

export default function LeadTray({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label="Selected lead"
      className="min-w-0 border-t border-(--crm-line) bg-(--crm-panel) p-5 2xl:border-t-0 2xl:border-l"
    >
      {!lead ? (
        <p className="text-[12px] text-(--crm-muted)">Select a lead to see its details.</p>
      ) : (
        <>
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold leading-snug text-(--crm-text)">{lead.name}</h2>
              <p className="mt-1 text-[12px] text-(--crm-text-secondary)">{lead.contact}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[12px] text-(--crm-muted) hover:text-(--crm-text)"
            >
              Close
            </button>
          </header>

          <p className="mt-3 inline-block rounded-full border border-(--crm-status) px-3 py-1 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.12em] text-(--crm-status)">
            {lead.lostReason ? `Lost · ${lead.stage}` : lead.stage}
          </p>

          <dl className="mt-4 mb-5">
            {[
              { label: "Phone", value: lead.phone || NOT_RECORDED },
              { label: "Email", value: lead.email || NOT_RECORDED },
              { label: "Owner", value: lead.owner },
              { label: "Tags", value: tagsOf(lead) },
              { label: "Source", value: lead.source },
              ...(lead.lostReason ? [{ label: "Lost reason", value: lead.lostReason }] : []),
            ].map((fact) => (
              <div
                key={fact.label}
                className="flex items-start justify-between gap-4 border-b border-(--crm-line) py-2.5 text-[12px]"
              >
                <dt className="text-(--crm-text-secondary)">{fact.label}</dt>
                <dd
                  className={`text-right break-all ${
                    fact.value === NOT_RECORDED ? "text-(--crm-muted)" : "font-bold text-(--crm-text)"
                  }`}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          {lead.evidence && <section className="mb-4 rounded-lg border border-(--crm-line) p-3" aria-label="Recorded next step"><h3 className="text-[12px] font-bold text-(--crm-text)">{NEXT_ACTION_LABELS[lead.evidence.nextAction]} · {lead.evidence.priority}</h3><p className="mt-1 text-[12px] text-(--crm-text-secondary)">{lead.evidence.priorityReason}</p><p className="mt-2 text-[11px] text-(--crm-muted)">{lead.evidence.openTasks} open tasks · {lead.evidence.overdueTasks} overdue · Fixed Odoo evidence, not AI.</p></section>}

          {!lead.lostReason && (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
                Book trial
              </button>
              <Link href={`/crm/leads/${lead.id}`} className={actionButton}>Review next action</Link>
              <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
                Propose stage
              </button>
            </div>
          )}

          <Link
            href={`/crm/leads/${lead.id}`}
            className="mt-5 inline-block text-[12px] font-bold text-(--crm-text) underline-offset-4 hover:underline"
          >
            Open lead →
          </Link>
        </>
      )}
    </aside>
  );
}
