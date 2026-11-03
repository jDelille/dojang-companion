import { cache } from "react";
import { explainHubError } from "@/domain/hubAction";
import type { FollowUp, FollowUpsRead } from "@/domain/followUp";
import type { CrmAssignee, CrmContext, CrmStage, Lead, LeadAssigneesRead, LeadEvidence, LeadTag } from "@/domain/lead";
import type { LeadDetails, LeadNote, LeadTask, LeadTimelineEntry } from "@/domain/leadDetails";
import { hubEnabled, readHubAsStaff } from "@/server/hub-gateway";
import { devCrmContext, devLeadDetails } from "@/server/crm-fixture";

// The only place the Sales pipeline gets CRM data from. Runs on the server.
//
//   DOJANG_HUB_ENABLED=true   the Hub's crm_context in Odoo, as the signed-in staff
//                             member (src/server/hub-gateway.ts). Read-only. If Odoo
//                             or sign-in fails, the answer says so; never fixture data.
//                             One lead's record comes from the Hub's lead_details.
//   otherwise                 the development fixture (src/server/crm-fixture.ts),
//                             outside production only.

export const USES_SAMPLE_LEADS = !hubEnabled() && process.env.NODE_ENV !== "production";

const NOT_CONNECTED = "CRM data isn't connected to Odoo yet";

// What a read gives a page. "unavailable" carries the Hub's code, so a page can
// offer sign-in for SIGN_IN_REQUIRED.
export type Unavailable = { outcome: "unavailable"; code: string; text: string };
export type CrmAnswer = { outcome: "loaded"; context: CrmContext } | Unavailable;
export type LeadDetailsAnswer =
  | { outcome: "loaded"; details: LeadDetails }
  | { outcome: "missing" } // no such lead (fixture only; the Hub says LEAD_UNAVAILABLE)
  | Unavailable;

const unavailable = (code: string): Unavailable => ({ outcome: "unavailable", code, text: explainHubError(code) });

// An answer DreamOS can't read is reported, not guessed around
const UNREADABLE: Unavailable = {
  outcome: "unavailable",
  code: "HUB_RESPONSE_UNREADABLE",
  text: "Odoo sent CRM data DreamOS can't read.",
};

// ---------------------------------------------------------------------------
// The Hub's shapes (dojo_companion_hub models/crm.py, as Companion's
// CrmWorkspace reads them)

const PRIORITIES: LeadEvidence["priority"][] = ["Low", "Normal", "High", "Now"];
const NEXT_ACTIONS: LeadEvidence["nextAction"][] = ["follow_up", "trial", "reactivation", "conversion"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string";
const isTextOrNull = (value: unknown): value is string | null => value === null || typeof value === "string";
const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// One entry of crm_context.stages: { id, name }
function stageFromContext(entry: unknown): CrmStage | null {
  if (!isObject(entry) || !isText(entry.id) || !isText(entry.name)) return null;
  return { id: entry.id, name: entry.name };
}

// One entry of a lead's tags: { id, name }
function tagFromLead(entry: unknown): LeadTag | null {
  if (!isObject(entry) || !isText(entry.id) || !isText(entry.name)) return null;
  return { id: entry.id, name: entry.name };
}

// lead.evidence, only the fields the screens use. Undefined when the Hub sent
// none (its CRM update isn't installed); null when it sent one DreamOS can't read.
function evidenceFromLead(value: unknown): LeadEvidence | undefined | null {
  if (value === undefined) return undefined;
  if (!isObject(value)) return null;
  const priority = value.priority as LeadEvidence["priority"];
  const nextAction = value.nextAction as LeadEvidence["nextAction"];
  if (
    !isText(value.journey) ||
    !PRIORITIES.includes(priority) ||
    !isText(value.priorityReason) ||
    !NEXT_ACTIONS.includes(nextAction) ||
    !isCount(value.openTasks) ||
    !isCount(value.overdueTasks) ||
    !isCount(value.dueToday) ||
    typeof value.trialLinked !== "boolean" ||
    typeof value.memberLinked !== "boolean"
  ) {
    return null;
  }
  return {
    journey: value.journey,
    priority,
    priorityReason: value.priorityReason,
    nextAction,
    openTasks: value.openTasks,
    overdueTasks: value.overdueTasks,
    dueToday: value.dueToday,
    trialLinked: value.trialLinked,
    memberLinked: value.memberLinked,
  };
}

// One entry of crm_context.leads: { id, name, contact, email, phone, version,
// stageId, stage, ownerId, owner, source, tags, canEditContact, evidence? }.
// No lostReason: crm_context leaves archived (lost) leads out.
function leadFromContext(entry: unknown): Lead | null {
  if (
    !isObject(entry) ||
    !isText(entry.id) ||
    !isText(entry.name) ||
    !isText(entry.contact) ||
    !isText(entry.email) ||
    !isText(entry.phone) ||
    !isCount(entry.version) ||
    !isTextOrNull(entry.stageId) ||
    !isText(entry.stage) ||
    !isTextOrNull(entry.ownerId) ||
    !isText(entry.owner) ||
    !isText(entry.source) ||
    !Array.isArray(entry.tags) ||
    (entry.canEditContact !== undefined && typeof entry.canEditContact !== 'boolean')
  ) {
    return null;
  }
  const tags: LeadTag[] = [];
  for (const each of entry.tags) {
    const tag = tagFromLead(each);
    if (!tag) return null;
    tags.push(tag);
  }
  const evidence = evidenceFromLead(entry.evidence);
  if (evidence === null) return null;
  return {
    id: entry.id,
    name: entry.name,
    contact: entry.contact,
    email: entry.email,
    phone: entry.phone,
    version: entry.version,
    stageId: entry.stageId,
    stage: entry.stage,
    ownerId: entry.ownerId,
    owner: entry.owner,
    source: entry.source,
    tags,
    ...(typeof entry.canEditContact === 'boolean' ? { canEditContact: entry.canEditContact } : {}),
    evidence,
  };
}

const FOLLOW_UP_STATES: FollowUp["state"][] = ["overdue", "today", "planned", "done"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// One entry of crm_context.tasks: { id, relatedType, relatedId, relatedName,
// summary, due, owner, state, version, canComplete, feedback }. feedback is
// left out: these are open tasks. Odoo writes a missing due date as "False",
// which becomes null (no due date), never a made-up one.
function followUpFromContext(entry: unknown): FollowUp | null {
  if (!isObject(entry)) return null;
  const state = entry.state as FollowUp["state"];
  if (
    !isText(entry.id) ||
    (entry.relatedType !== "lead" && entry.relatedType !== "member") ||
    !isText(entry.relatedId) ||
    !isText(entry.relatedName) ||
    !isText(entry.summary) ||
    !isText(entry.due) ||
    !isText(entry.owner) ||
    !FOLLOW_UP_STATES.includes(state) ||
    !isCount(entry.version) ||
    typeof entry.canComplete !== "boolean"
  ) {
    return null;
  }
  return {
    id: entry.id,
    relatedType: entry.relatedType,
    relatedId: entry.relatedId,
    relatedName: entry.relatedName,
    summary: entry.summary,
    due: DATE.test(entry.due) ? entry.due : null,
    owner: entry.owner,
    state,
    version: entry.version,
    canComplete: entry.canComplete,
  };
}

// crm_context.tasks and moreTasks. Kept apart from the leads: a Hub that sends
// no tasks, or tasks DreamOS can't read, still shows the pipeline, and the
// follow-ups say which it was. One unreadable task makes the list unreadable
// (never a shorter list).
function followUpsFrom(result: Record<string, unknown>): FollowUpsRead {
  if (result.tasks === undefined) return { outcome: "notSent" };
  if (!Array.isArray(result.tasks) || typeof result.moreTasks !== "boolean") return { outcome: "unreadable" };
  const tasks: FollowUp[] = [];
  for (const entry of result.tasks) {
    const task = followUpFromContext(entry);
    if (!task) return { outcome: "unreadable" };
    tasks.push(task);
  }
  return { outcome: "loaded", tasks, moreTasks: result.moreTasks };
}

// crm_context.assignees: [{ id, name }], or null when not sent or unreadable
function assigneesFrom(value: unknown): CrmAssignee[] | null {
  if (!Array.isArray(value)) return null;
  const assignees: CrmAssignee[] = [];
  for (const entry of value) {
    if (!isObject(entry) || !isText(entry.id) || !isText(entry.name)) return null;
    assignees.push({ id: entry.id, name: entry.name });
  }
  return assignees;
}

// The established crm_context read supplies site-authorized assignees. Keep
// missing, malformed and confirmed-empty choices distinct; never use lead owners.
export async function getLeadAssignees(): Promise<LeadAssigneesRead> {
  if (!hubEnabled()) return { outcome: 'unavailable', code: 'HUB_NOT_CONFIGURED', text: 'Owner assignment requires a connected Odoo site.' };
  const answer = await readHubAsStaff('crm_context', { query: '' });
  if (!answer.ok) return unavailable(answer.code);
  if (answer.result.assignees === undefined) return { outcome: 'unavailable', code: 'ASSIGNEES_NOT_PROVIDED', text: 'This Hub read does not provide authorized assignees.' };
  const assignees = assigneesFrom(answer.result.assignees);
  if (!assignees || assignees.some(a => !/^[1-9][0-9]{0,9}$/.test(a.id) || !a.name.trim())
    || new Set(assignees.map(a => a.id)).size !== assignees.length) {
    return { outcome: 'unavailable', code: 'HUB_RESPONSE_UNREADABLE', text: 'Odoo returned assignee data this app cannot read.' };
  }
  return { outcome: 'loaded', assignees };
}

// cache(): the Sales page and Do For Me share one read per request. query ""
// is every lead; otherwise Odoo matches the lead or contact name (the command
// bar's lead search).
const readHubCrm = cache(async (query: string): Promise<CrmAnswer> => {
  const answer = await readHubAsStaff("crm_context", { query });
  if (!answer.ok) return unavailable(answer.code);
  const result = answer.result;
  if (!Array.isArray(result.stages) || !Array.isArray(result.leads) || typeof result.moreLeads !== "boolean") {
    return UNREADABLE;
  }
  const stages: CrmStage[] = [];
  for (const entry of result.stages) {
    const stage = stageFromContext(entry);
    if (!stage) return UNREADABLE;
    stages.push(stage);
  }
  const leads: Lead[] = [];
  for (const entry of result.leads) {
    const lead = leadFromContext(entry);
    if (!lead) return UNREADABLE;
    leads.push(lead);
  }
  return {
    outcome: "loaded",
    context: {
      stages,
      leads,
      moreLeads: result.moreLeads,
      followUps: followUpsFrom(result),
      assignees: assigneesFrom(result.assignees),
    },
  };
});

const TASK_STATES: LeadTask["state"][] = ["overdue", "today", "planned", "done"];

// One entry of lead_details.tasks: { id, relatedType, relatedId, relatedName,
// summary, due, owner, state, version, canComplete, feedback }. Only the fields
// the lead page shows.
function taskFromDetails(entry: unknown, leadId: string): LeadTask | null {
  if (!isObject(entry)) return null;
  const state = entry.state as LeadTask["state"];
  if (
    !isText(entry.id) ||
    !isText(entry.summary) ||
    !isText(entry.due) ||
    !isText(entry.owner) ||
    !TASK_STATES.includes(state) ||
    !isText(entry.feedback)
  ) {
    return null;
  }
  if (entry.version !== undefined && !isCount(entry.version)) return null;
  if (entry.canComplete !== undefined && typeof entry.canComplete !== "boolean") return null;
  if (entry.relatedType !== undefined && entry.relatedType !== "lead") return null;
  if (entry.relatedId !== undefined && entry.relatedId !== leadId) return null;
  // A completion control requires explicit authoritative task-to-lead identity.
  const canComplete = entry.canComplete === true && entry.relatedType === "lead" && entry.relatedId === leadId;
  return { id: entry.id, summary: entry.summary, due: entry.due, owner: entry.owner, state, feedback: entry.feedback,
    ...(typeof entry.version === "number" ? { version: entry.version } : {}),
    ...(typeof entry.canComplete === "boolean" ? { canComplete } : {}),
  };
}

// One entry of lead_details.notes: { id, text, author, at }
function noteFromDetails(entry: unknown): LeadNote | null {
  if (!isObject(entry) || !isText(entry.id) || !isText(entry.text) || !isText(entry.author) || !isText(entry.at)) {
    return null;
  }
  return { id: entry.id, text: entry.text, author: entry.author, at: entry.at };
}

// One entry of lead_details.timeline: { id, action, actor, at }
function timelineEntryFromDetails(entry: unknown): LeadTimelineEntry | null {
  if (!isObject(entry) || !isText(entry.id) || !isText(entry.action) || !isText(entry.actor) || !isText(entry.at)) {
    return null;
  }
  return { id: entry.id, action: entry.action, actor: entry.actor, at: entry.at };
}

// Every entry of a list read with readEntry, or null if the list or any one
// entry can't be read (never a shorter list)
function listFrom<T>(value: unknown, readEntry: (entry: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) return null;
  const entries: T[] = [];
  for (const each of value) {
    const entry = readEntry(each);
    if (!entry) return null;
    entries.push(entry);
  }
  return entries;
}

// lead_details.trial: { title, startsAt } or null. Undefined when unreadable.
function trialFromDetails(value: unknown): LeadDetails["trial"] | undefined {
  if (value === null) return null;
  if (!isObject(value) || !isText(value.title) || !isText(value.startsAt)) return undefined;
  return { title: value.title, startsAt: value.startsAt };
}

// lead_details { leadId } -> { lead, tasks, stages, memberId, trial, timeline, notes? }.
// stages are only needed for a stage proposal, so they aren't read.
const readHubLead = cache(async (id: string): Promise<LeadDetailsAnswer> => {
  // The Hub only takes positive record ids; anything else isn't a lead
  if (!/^[1-9][0-9]{0,9}$/.test(id)) return unavailable("LEAD_UNAVAILABLE");
  const answer = await readHubAsStaff("lead_details", { leadId: id });
  if (!answer.ok) return unavailable(answer.code);
  const result = answer.result;

  const lead = leadFromContext(result.lead);
  const tasks = listFrom(result.tasks, (entry) => taskFromDetails(entry, id));
  const timeline = listFrom(result.timeline, timelineEntryFromDetails);
  const trial = trialFromDetails(result.trial);
  // Notes came with a later Hub update: absent means unknown, not none
  const notes = result.notes === undefined ? null : listFrom(result.notes, noteFromDetails);
  if (!lead || !tasks || !timeline || trial === undefined || !isTextOrNull(result.memberId)) return UNREADABLE;
  if (result.notes !== undefined && notes === null) return UNREADABLE;
  // Never show a different lead under /crm/leads/<id>
  if (lead.id !== id) return UNREADABLE;

  return {
    outcome: "loaded",
    details: { lead, tasks, memberId: result.memberId, trial, notes, timeline },
  };
});

// ---------------------------------------------------------------------------

// The Sales pipeline: stages and open leads (in Hub mode: the latest 100 this
// staff member's grant can see on this site)
export async function getCrmContext(query = ""): Promise<CrmAnswer> {
  const wanted = query.trim();
  if (wanted.length > QUERY_LIMIT) return unavailable("INVALID_COMMAND");
  if (hubEnabled()) return readHubCrm(wanted);
  if (USES_SAMPLE_LEADS) {
    const context = devCrmContext();
    if (wanted) {
      const lowered = wanted.toLowerCase();
      context.leads = context.leads.filter((lead) => !lead.lostReason && (
        lead.name.toLowerCase().includes(lowered) || lead.contact.toLowerCase().includes(lowered)
      ));
    }
    return { outcome: "loaded", context };
  }
  throw new Error(NOT_CONNECTED);
}

export type LeadSearchAnswer = { outcome: "loaded"; leads: Lead[]; moreLeads: boolean } | Unavailable;

// The Hub's limit on crm_context's query
const QUERY_LIMIT = 100;

// Open leads whose name or contact matches (the Hub's crm_context with a query:
// Odoo's own case-insensitive match, newest first, the latest 100). Like the
// pipeline, archived (lost) leads aren't included.
export async function searchLeads(query: string): Promise<LeadSearchAnswer> {
  const wanted = query.trim();
  if (!wanted || wanted.length > QUERY_LIMIT) return unavailable("INVALID_COMMAND");
  if (hubEnabled()) {
    const answer = await readHubCrm(wanted);
    if (answer.outcome !== "loaded") return answer;
    return { outcome: "loaded", leads: answer.context.leads, moreLeads: answer.context.moreLeads };
  }
  if (USES_SAMPLE_LEADS) {
    const lowered = wanted.toLowerCase();
    const leads = devCrmContext().leads.filter(
      (lead) =>
        !lead.lostReason &&
        (lead.name.toLowerCase().includes(lowered) || lead.contact.toLowerCase().includes(lowered)),
    );
    return { outcome: "loaded", leads, moreLeads: false };
  }
  throw new Error(NOT_CONNECTED);
}

// One lead's detail record (the Hub's lead_details), for the lead page
export async function getLeadDetails(leadId: string): Promise<LeadDetailsAnswer> {
  if (hubEnabled()) return readHubLead(leadId);
  if (USES_SAMPLE_LEADS) {
    const details = devLeadDetails(leadId);
    return details ? { outcome: "loaded", details } : { outcome: "missing" };
  }
  throw new Error(NOT_CONNECTED);
}
