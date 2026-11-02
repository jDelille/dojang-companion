import type { SubjectRef } from "./definition";
import type { Fact, HubRequest } from "./actions";

/*
   One run of a workflow on one subject, and its log. Adapted from Roster
   1.0.0's RetentionRun (prisma/schema.prisma) and RetentionLogEntry
   (lib/retention-shared.ts). Roster's statuses were pending, running,
   completed, failed and cancelled. These are added:

     awaiting_approval  a step's request is prepared and waits for staff
     uncertain          the Hub didn't confirm (it may have saved). Only an
                        explicit retry with the SAME request key continues;
                        Roster's worker re-threw failed steps so BullMQ
                        retried them, which can send twice
     blocked            the run can't go on without someone: a capability with
                        no contract, an unknown condition, a missing field, a
                        changed definition

   Roster's "running" isn't kept. A step is either prepared (awaiting_approval)
   or sent by the approving staff member; whatever claims due runs (store.ts)
   holds a lease instead.
*/

export type RunStatus =
  | "pending" // waits for nextRunAt
  | "awaiting_approval"
  | "uncertain"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled";

// Statuses that never change again
export const FINAL_STATUSES: RunStatus[] = ["completed", "failed", "cancelled"];

export type LogStatus =
  | "done" // a wait finished, or the Hub confirmed the action
  | "skipped" // a skip_step condition was met, or staff declined the step
  | "ended" // an end_run condition was met
  | "prepared" // the request is waiting for approval
  | "approved"
  | "declined"
  | "deferred" // the subject couldn't be read; the step is tried again later
  | "failed" // the Hub refused; nothing changed
  | "uncertain"
  | "blocked"
  | "resumed" // staff restarted a blocked run
  | "cancelled";

export type LogEntry = {
  at: string; // ISO time
  stepIndex: number;
  stepId: string;
  status: LogStatus;
  detail: string;
  actor?: string; // who approved/declined/retried/cancelled; never the engine
  requestKey?: string;
  receiptId?: string; // the Hub's record of what it did (task id, …)
};

// A step's prepared Hub request, frozen once made: the approval shows it,
// the executor sends exactly it, and a retry after "uncertain" resends it with
// the same key so the Hub replays its first answer instead of acting twice.
export type PreparedRequest = {
  stepIndex: number;
  requestKey: string;
  request: HubRequest;
  capability: string;
  changes: Fact[];
  unchanged: Fact[];
  preparedAt: string;
};

export type WorkflowRun = {
  id: string;
  definitionId: string;
  definitionVersion: number; // the version it was enrolled in
  subject: SubjectRef;
  enrolledAt: string;
  enrolledBy: string; // the staff member who enrolled it (manual trigger)
  status: RunStatus;
  stepIndex: number; // the step to run next (or being approved)
  nextRunAt: string | null; // when a pending run's step is due; null otherwise
  prepared: PreparedRequest | null;
  blockedReason: string | null;
  log: LogEntry[];
};

// What an executor reports back for one Hub request
//   confirmed  the Hub saved it (or replayed the save of this key)
//   rejected   the Hub said no; nothing changed
//   uncertain  no usable answer; it may have saved
export type ActionOutcome =
  | { status: "confirmed"; receiptId: string; replayed: boolean }
  | { status: "rejected"; code: string }
  | { status: "uncertain" };

// Sends one prepared request as the staff member approving it. The only way a
// workflow changes anything (src/integrations/workflowActions.ts).
export type ActionExecutor = (request: HubRequest, requestKey: string) => Promise<ActionOutcome>;
