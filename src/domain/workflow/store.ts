import type { SubjectRef, WorkflowDefinition } from "./definition";
import type { WorkflowRun } from "./run";

/*
   Where workflow definitions and runs live: an INTERFACE ONLY. Who owns this
   persistence (Odoo models through the Hub, a DreamOS/edge database, Temporal,
   …) is not decided, and nothing in DreamOS implements it. Roster kept
   RetentionRule/RetentionRun in Prisma and used BullMQ delayed jobs for
   timing; neither is adopted. docs/WORKFLOW-ENGINE.md lists the requirements
   and the open questions.

   What any implementation must guarantee (the engine relies on these):

   R1  Versioned definitions. A saved definition never changes; editing makes
       version + 1. getDefinition(id, version) returns the exact version a run
       was enrolled in.
   R2  One run per definition and subject. createRun refuses a second run of the
       same definition id on the same subject while one isn't final, so two
       enrolments can't both act (Roster: unique ruleId + contactId).
   R3  Compare-and-set saves. saveRun only writes if the stored revision is the
       one that was read. Two workers, or a worker and an approving staff
       member, can't both move the same run.
   R4  Leased claiming. claimDueRuns hands each due pending run (nextRunAt <= now)
       to one caller for a limited time, so a crashed worker's runs come back
       instead of running twice or never.
   R5  Append-only log. Entries are never edited or removed; the log is the
       run's audit trail next to the Hub's own receipts.
   R6  Tenant and site scope. Every definition and run belongs to one site; a
       read never returns another site's runs. Scope comes from the
       authenticated server context, never the browser.
   R7  Privacy on sign-out. Runs name Odoo records; listing them follows the
       same Hub grants as reading those records.
*/

export type StoredRun = { run: WorkflowRun; revision: number };

export interface WorkflowStore {
  getDefinition(id: string, version: number): Promise<WorkflowDefinition | null>;
  // The newest version of each definition that is switched on
  listActiveDefinitions(): Promise<WorkflowDefinition[]>;
  // Saves a new version; refuses a version that already exists (R1)
  saveDefinition(definition: WorkflowDefinition): Promise<{ saved: true } | { saved: false; reason: "version_exists" }>;

  // R2: "already_running" when a non-final run of this definition exists on the subject
  createRun(run: WorkflowRun): Promise<{ created: StoredRun } | { created: null; reason: "already_running" }>;
  getRun(id: string): Promise<StoredRun | null>;
  // R3: "stale" when someone saved the run since `revision` was read
  saveRun(run: WorkflowRun, revision: number): Promise<{ saved: StoredRun } | { saved: null; reason: "stale" }>;
  // R4: up to `limit` due pending runs, each leased to this caller until leaseUntil
  claimDueRuns(now: string, limit: number, leaseUntil: string): Promise<StoredRun[]>;
  // Runs waiting for a staff member, for an approvals list
  listRunsAwaitingApproval(): Promise<StoredRun[]>;
  listRunsFor(subject: SubjectRef): Promise<StoredRun[]>;
}
