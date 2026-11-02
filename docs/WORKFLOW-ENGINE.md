# Companion workflow engine

Status 2026-11-02. The engine is pure domain code with tests. Nothing in the app
calls it yet: there's no UI, no scheduler and no storage. Persistence ownership is
**not decided**.

Source: Roster 1.0.0 retention engine (`lib/retention.ts`, `lib/retention-shared.ts`,
`workers/retentionSender.ts`, `RetentionRule`/`RetentionRun` in `prisma/schema.prisma`).
Copies and hashes are in `docs/LICENSE-MAP.md`.

## Layers

| Layer | File | Owns | Doesn't |
| --- | --- | --- | --- |
| Definition | `src/domain/workflow/definition.ts` | steps, delays, conditions, templates, versions | know how actions happen |
| Business actions | `src/domain/workflow/actions.ts` | capability catalog, inputs, what changes / won't, Hub binding or missing contract | run anything |
| Execution | `src/domain/workflow/engine.ts`, `run.ts` | validate, dry run, enrol, advance one step, approve/decline, explicit retry, resume, cancel, log | store, schedule, call the Hub |
| Persistence | `src/domain/workflow/store.ts` | interface plus requirements R1-R7 | any implementation |
| Subjects | `src/domain/workflow/subjects.ts` | Subject from `lead_details` / Member, only returned fields | invent fields |
| Executor | `src/integrations/workflowActions.ts` | send a prepared request through `/api/hub` as the approving staff member | operations the gateway doesn't forward |

## Roster to Dojang

| Roster | Dojang |
| --- | --- |
| Step mutates directly (Twilio, Nodemailer, push, Prisma) | Step names a capability; the engine prepares a Hub request; a staff member approves; the executor sends it as them |
| `create_task` | `crm.lead.prepare_follow_up` -> Hub `prepare_lead_action` (kind `follow_up`). **The only connected capability.** |
| `send_email` / `send_sms` / `send_push` | `communication.send`: not connected |
| `add_tag` / `remove_tag`, `change_stage` | `crm.lead.tag`, `crm.lead.change_stage`: not connected |
| `notify_team`, `request_review` | `staff.notify`, `reputation.request_review`: not connected |
| `wait` | engine primitive (`kind: "wait"`) |
| `delayMinutes` (after previous step) | same |
| `skipIfReplied` | condition `subject.replied_since_enrolment`, `then: "end_run"`. It's always unknown (no read has the last inbound time), so it blocks |
| `requireOpened` (declared, never implemented in Roster) | not taken |
| Dry-run log entries | `dryRun()` plan: due time, outcome, what changes, what won't |
| Statuses pending/running/completed/failed/cancelled | pending, awaiting_approval, uncertain, blocked, completed, failed, cancelled |
| Failed step re-thrown for BullMQ retry (can send twice) | failed is final; uncertain waits for an explicit retry with the same request key |
| `renderTemplate` fallback "there" / leaves `{{x}}` | missing field blocks the step |
| Rule edits affect running runs | runs pinned to a definition version; a changed version blocks them |
| 5-minute scan enrols matching contacts | manual enrolment only (no Hub scan read, no scheduler) |

## Persistence requirements (owner undecided)

R1-R7 are in `store.ts`: versioned definitions, one active run per definition and
subject, compare-and-set saves, leased claiming of due runs, append-only log, site
scope from server context, and record-level visibility that follows Hub grants.

Data to store: definitions (id, version, site, subject kind, trigger, steps, active,
author, created at). Runs (all of `WorkflowRun`, plus revision, lease holder and lease
expiry, site). The log is append-only. Prepared requests hold a request key that
must survive restarts, because a retry has to reuse it.

The options aren't decided between. Each needs a decision from Jodi/Paul:

| Option | Notes |
| --- | --- |
| Odoo models through new Hub ops | Same audit and grants as other records. Needs Hub ops for definition CRUD, run create/save/claim/list. Scheduling could use Odoo cron. |
| DreamOS/edge database | Fast to build, but a second database next to Odoo. AGENTS.md forbids a second *authoritative* business record, so runs would have to be clearly non-authoritative orchestration state. |
| Temporal (Paul's doc mentions it) | Durable timers and retries built in. The engine's pure steps would map to activities. A new service to run. |

## Other open decisions

1. **Who runs due steps.** A scheduler with no staff session can only *prepare*. It
   still needs a Hub read identity to read subjects (a service principal doesn't
   exist on the Hub). Approval runs in the approving staff member's own session.
2. **May any capability run unattended?** Today every step needs staff approval
   (`ApprovalPolicy`).
3. **What declining means:** skip the step or cancel the run. `decline()` takes either.
4. **Stale approvals.** The request is frozen at preparation. If the lead changes
   before approval, Odoo answers VERSION_CONFLICT and the run fails. Re-preparing
   instead is possible but not decided.
5. **Site time zone** for due dates (the caller passes `today`).
6. **Triggers.** Scanning for matching records needs a Hub read per trigger type.
7. **Approvals UI.** Where staff see runs awaiting approval (the Do For Me rail Work
   tab or Today's Needs decision).

## Tests

`bash tools/test-workflow-engine.sh` runs 17 node tests on the compiled domain
code. The test executors are doubles inside the test file only.
