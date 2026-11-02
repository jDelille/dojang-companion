# Governed CRM internal actions

DreamOS now forwards two additional existing Jodi operations through the shared
authenticated `/api/hub` gateway. No replacement backend or direct ORM call.

Verified against `dojo_companion_hub/models/crm.py` in the local Jodi Odoo source:

| Operation | Exact payload | Confirmed result |
| --- | --- | --- |
| `complete_task` | `taskId`, `expectedVersion`, `feedback` (1–1000 characters) | matching `taskId`, matching `leadId` or `memberId`, `state: done`, `replayed` |
| `add_lead_note` | `leadId`, `expectedVersion`, `note` (1–2000 characters) | matching `leadId`, `noteId`, `state: saved`, `messageSent: false`, `replayed` |

The Hub requires owner/manager access, verifies site/company and actual linked
record scope, locks records and checks versions. Only active manual TODO tasks
are completable; automated tasks remain blocked. Already-done tasks return done.
Internal-note posting and activity feedback use `companion_internal_task`; the
Jodi notification override suppresses outbound notifications. Hub request-key
fingerprinting, receipt replay and replay authorization remain authoritative.

## Workflow

1. Open `/crm/leads/<id>` and review evidence, activity, notes and tasks.
2. Save an internal note under Notes. After Hub confirmation, the refreshed
   `lead_details` read supplies the saved note text, author and timestamp.
3. Use **Record outcome / complete task**, enter feedback and confirm. The same
   editor is available from a selected task in `/crm/follow-ups`, including
   authorized member-linked tasks. Only one queue editor mounts across layouts.
4. After the refreshed evidence recommends a next follow-up, review the existing
   Do For Me proposal and Apply. This creates an internal task only.

Pending operations disable editing and repeat submission. Success is shown only
after identity-checked Hub confirmation. Conflicts retain text and offer refresh
and review. Network loss, malformed success or backend uncertainty freeze the
original payload and request key; explicit retry reuses both. No automatic retry.
Authentication loss clears staff workspace/Companion context and suppresses the
record through the shared signed-out shell. Ordinary errors retain workspace state.

Confirmed writes revalidate the affected lead/member, pipeline, task queue and
front desk paths. The active page calls `router.refresh()` to fetch no-store Hub
reads immediately. Notes/task completion are disabled in fixture mode; existing
fixture follow-up behavior is unchanged. Legacy reads without task version,
manual permission or explicit task-to-lead identity do not gain write controls.

Outbound messaging, stage changes, assignment, arbitrary task creation, kiosk and
lead AI are outside this pass. No browser automation or live Odoo writes were
used for verification. Manual staging verification is still needed.
