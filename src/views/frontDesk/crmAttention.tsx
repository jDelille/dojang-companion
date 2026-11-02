"use client";

import Link from "next/link";
import { compareFollowUps, recordHref } from "@/domain/followUp";
import { DueText } from "@/views/crm/followUpPanel";
import type { CrmRead } from "./frontDeskRail";

// The operational task queue and CRM share exactly the same authoritative read.
export default function CrmAttention({ crm }: { crm: CrmRead }) {
  const panel = "rounded-2xl border border-(--crm-line) bg-(--crm-panel) p-5";
  if (crm.outcome !== "loaded") return <section className={panel}><h2 className="font-bold text-(--crm-text)">CRM follow-ups</h2><p role="alert" className="mt-2 text-[13px] text-(--crm-muted)">{crm.text}</p></section>;
  const read = crm.context.followUps;
  if (read.outcome !== "loaded") return <section className={panel}><h2 className="font-bold text-(--crm-text)">CRM follow-ups</h2><p className="mt-2 text-[13px] text-(--crm-muted)">{read.outcome === "notSent" ? "This Hub version does not provide the task queue." : "The task queue could not be read. No count is available."}</p></section>;
  const due = read.tasks.filter((task) => task.state === "overdue" || task.state === "today").sort((a, b) => (a.state === b.state ? compareFollowUps(a, b, crm.context.leads) : a.state === "overdue" ? -1 : 1));
  return <section className={panel} aria-label="CRM follow-ups"><header className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-(--crm-text)">CRM follow-ups</h2><p className="mt-1 text-[12px] text-(--crm-muted)">Overdue and due-today tasks on leads and members.</p></div><Link href="/crm/follow-ups" className="text-[12px] font-semibold text-(--crm-text) underline underline-offset-4">Full task queue →</Link></header>
    {due.length === 0 ? <p className="mt-4 text-[13px] text-(--crm-text-secondary)">{read.moreTasks ? "No due tasks are included in this response; additional tasks may exist." : "No overdue or due-today tasks were returned."}</p> : <ul className="mt-3 divide-y divide-(--crm-line)">{due.slice(0, 6).map((task) => <li key={task.id}><Link href={recordHref(task)} className="flex flex-wrap items-center justify-between gap-3 rounded-lg py-3 hover:bg-(--crm-raised)"><div><p className="text-[13px] font-semibold text-(--crm-text)">{task.summary}</p><p className="mt-1 text-[11px] text-(--crm-muted)">{task.relatedName} · {task.relatedType === "lead" ? "Lead" : "Member"} · {task.owner}</p></div><DueText task={task} /></Link></li>)}</ul>}
    {(read.moreTasks || due.length > 6) && <p className="mt-3 text-[11px] text-(--crm-muted)">{read.moreTasks ? "The source capped this task list. Counts apply only to the returned tasks." : `${due.length - 6} more due tasks in the full queue.`}</p>}
  </section>;
}
