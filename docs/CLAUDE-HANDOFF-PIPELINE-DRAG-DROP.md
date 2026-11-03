# Claude handoff: governed pipeline drag and drop

## User objective

Add real drag-and-drop stage movement to the migrated Roster Sales pipeline.
Moving a card must change the authoritative Odoo lead stage through the Jodi
Hub, not merely rearrange browser state or create a review task.

**Authorization status:** the user requested drag and drop. Codex discovered
that no suitable governed stage-change operation exists and asked for explicit
permission to extend Jodi's Hub. The user's next message requested this handoff
file; they have not explicitly answered that backend-extension question yet.
Do not treat this document as that approval. Confirm permission for the new Hub
operation/backend changes before implementing those dependent changes, unless
the user explicitly authorizes them when giving you this handoff.

## Workspace and work to preserve

- DreamOS: `C:\Users\justi\Desktop\nextjs`
- Current branch: `roster-integration`.
- Baseline commit: `9f47661` (`wip: working on crm functionality`).
- Important uncommitted Roster integration work exists. Inspect current Git
  status in both repositories before doing anything. Do not reset, overwrite,
  discard or stash that work. No commits/pushes unless explicitly requested.
- Read the applicable `AGENTS.md` files. For Next.js changes, read the relevant
  guide in `node_modules/next/dist/docs/`.
- No browser automation unless explicitly requested. No production/live test
  writes, provider sends, or unrelated cleanup.

Current DreamOS changes at handoff:

```text
Modified:
  docs/LICENSE-MAP.md
  src/config/dojang.ts
  src/views/crm/salesPipeline.tsx
  vendor/licensed/README.md
Untracked:
  docs/ROSTER-INTEGRATION.md
  src/app/(main)/roster/
  src/templates/
  tests/roster/
  tools/import-roster-source.py
  tools/test-roster.sh
  vendor/licensed/roster/source/
```

This handoff file is also new. Git state can change after this snapshot.

## Current Sales implementation

The actual Roster-derived board has replaced the previous board at `/crm`.
The existing DreamOS Sales host retains all its business/workflow behavior.
`/roster` redirects to `/crm`, preserving a `q` search query. There is no
separate Roster navigation item.

Relevant files:

| File | Responsibility |
| --- | --- |
| `src/views/crm/salesPipeline.tsx` | Search, owner/stage/source/tag filters, attention filters, sorting, board/list switch, selected lead, Companion context and lead tray |
| `src/templates/roster/components/pipeline/kanban.tsx` | Actual migrated Roster columns/cards; currently read-only stage selector and no drag handlers |
| `src/templates/roster/adapters/pipeline.ts` | Projects authoritative CRM leads/stages into the board's display shape |
| `src/templates/roster/roster.css` | Scoped Ledger-to-DreamOS theme bridge |
| `src/app/(main)/crm/page.tsx` | Server-side authenticated CRM read/search and Companion read |
| `src/integrations/crm.ts` | `getCrmContext` / `getLeadDetails`, real-read parsing and explicit fixture separation |
| `src/views/crm/leadTray.tsx` | Existing selected-lead tray |
| `src/views/crm/leadDetail.tsx` | Existing lead workspace and governed actions |
| `src/server/hub-gateway.ts` | Shared authenticated gateway and exact operation allowlist |
| `src/app/api/hub/route.ts` | Hub/fixture mode boundary |

The Sales host passes:

```tsx
<PipelineBoard
  data={boardData}
  showHeader={false}
  selection={{ id: selected?.id ?? null, onSelect: setSelectedId }}
/>
```

Controlled selection connects the cards to the existing tray and Companion.
Do not replace that with a second independent selected-lead object/modal.
The board still supports standalone preview mode for reference/tests.

Cards now show owner, source, tags and recorded evidence: priority, reason,
next action, open tasks, overdue tasks and due-today count. Missing evidence
remains unknown. Filters/sorting are supplied by `organizeLeads`.

The adapter currently omits lead versions from its display projection. A real
stage command will need the correct authoritative version; add a typed path for
that without manufacturing versions or looking up leads by name.

## Exact blocker verified by Codex

Jodi backend source inspected read-only:

```text
C:\Users\justi\Desktop\dojang\dojo-odoo-monday\addons\dojo_companion_hub\models\crm.py
C:\Users\justi\Desktop\dojang\dojo-odoo-monday\addons\dojo_companion_hub\models\service.py
```

Recheck current source before implementation.

### `propose_stage` does not move a lead

`crm.py`, `_propose_stage` (around lines 308–320):

```text
exact payload: leadId expectedVersion stageId reason due
scoped lead lookup, lock, lead version check
validates stage against global stages / the lead's team
creates an internal "Review stage: old -> new" activity
returns { leadId, taskId, state: "proposed", stageChanged: False }
```

Do not wire drag-and-drop to this operation and claim that a lead moved.
Do not silently change its meaning: other clients may rely on proposal-only
behavior. Its review task is not an authoritative stage change.

### `update_lead` does not accept stage changes

`crm.py`, `_update_lead` and `_lead_values`:

- Versioned contact/details update.
- Allowed change fields are name/contact/email/phone.
- Stage is not an allowed field.
- Do not smuggle `stage_id` through it or send arbitrary ORM writes.

### Existing dispatcher

`service.py` dispatches existing CRM operations around lines 485–486 and checks
replay permissions/scope around line 526. A new operation must participate in
the same governed dispatch, transaction, idempotency, receipts and replay
authorization behavior. Adding only a dispatch dictionary entry is insufficient.

## Recommended implementation, after authorization

### 1. Governed Jodi operation first

Choose and document a narrowly scoped operation name, such as
`change_lead_stage`. **That name is a proposal, not an existing contract.**
Confirm its design against the backend's own instructions and tests.

Suggested minimal command shape for review:

```text
payload: { leadId, expectedVersion, stageId }
requestKey: existing Hub envelope field
```

If product/policy requires a reason or explicit confirmation, establish that
requirement instead of inventing a default reason. Avoid adding unrelated fields.

Required backend properties:

- Trusted actor/site/grant derived from the existing session and Hub envelope.
- Owner/manager authorization consistent with current CRM operations.
- Existing scoped lead lookup; enforce company/site/team boundaries.
- Record lock and integer expected-version check before mutation.
- Target stage must be allowed for this specific lead and its team, not merely
  present somewhere in the browser's global stage list.
- Define same-stage/no-op behavior explicitly.
- Review terminal/won stages carefully: Odoo stage writes can trigger native
  business logic, probabilities or automations. Do not infer attendance, trial,
  billing, membership or outbound permission from a board move. If side effects
  cannot be safely bounded, report the exact blocker instead of bypassing Odoo.
- Use authoritative Odoo model/business methods; no direct SQL mutation or
  frontend ORM access. Preserve relevant Odoo concurrency/business rules.
- Use the existing Hub request-key fingerprint/replay/receipt mechanism.
- Extend replay authorization to recheck current role and record scope.
- Return an identity-checked authoritative result with the actual final stage
  and new lead version; shared Hub machinery supplies replay metadata.
- Keep `propose_stage` semantics unchanged.

### 2. DreamOS gateway and typed integration

- Add only the approved exact operation/payload to `FORWARDED_ACTIONS`.
- Reject extra tenant/actor/site/role keys, invalid IDs/versions and absent or
  malformed request keys before Odoo.
- Use the existing sealed staff session, configured site and `/api/hub` flow.
- Add typed command/result validators and verify returned lead and target-stage
  identity before showing success.
- Use existing `crmWrites.ts` patterns for confirmed / failed / notConfirmed.
- On network loss, timeout or malformed success, freeze both payload and key.
  Explicit retry must resend the exact original request. No automatic retries
  or new key while the outcome is unknown.
- Revalidate Sales, relevant lead detail and any other genuinely affected reads
  after confirmed success; call `router.refresh()` for the visible page.
- Do not leak secrets or add another auth/database/provider layer.

Useful existing examples:

```text
src/domain/crmWrites.ts
src/integrations/crmWrites.ts
src/views/crm/crmWriteForm.tsx
src/views/crm/taskCompletion.tsx
src/server/hub-gateway.ts
```

### 3. Restore Roster drag interactions safely

Original Roster source for native HTML5 drag-and-drop:

```text
vendor/licensed/roster/source/components/pipeline/kanban.tsx
```

It includes drag source/target tracking, column highlighting, drop handling,
keyboard left/right movement and a select fallback for touch. Adapt that actual
source. **Do not copy its optimistic stage mutation or `/api/pipeline/deals`
PATCH calls.**

Expected UX:

1. Drag a lead card to an allowed stage, or use an accessible keyboard/touch
   alternative.
2. Route every interaction through one governed move path.
3. Show the intended target/pending state, but retain the authoritative stage
   until Hub confirmation. An optimistic visual must never look like committed
   business state; simplest is to leave the card in its source column pending.
4. Prevent duplicate submission and competing moves while pending/uncertain.
5. Confirmed result: refresh authoritative CRM data and show the receipt/result.
6. Conflict: explain that the record changed, refresh and require fresh review;
   do not silently overwrite another staff member's change.
7. Unknown result: show uncertainty and a same-key retry, retaining original
   payload/version/target. Do not allow another drag to overwrite that attempt.
8. Authentication loss: use shared staff reset/signed-out behavior to clear and
   suppress sensitive lead/Companion context.

Important adapter edge cases:

- `display:no-stage` is an artificial **display-only** grouping key. It must
  never be sent to Odoo as a stage ID or treated as a permitted drop target.
- A lead whose stage is not in the stage list still appears in a display group;
  that does not grant permission to move other leads into it.
- Board filters can hide a successfully moved lead. Explain that state honestly
  rather than treating disappearance as failure or adding a fixture replacement.
- Preserve selection by authoritative ID, current lead-tray/Companion behavior,
  server search, filters, sorting, list view and fixture-only Lost handling.
- Real mode must never fall back to fixture moves. If adding a fixture simulator,
  keep it explicit and labelled; otherwise disable moves in fixture mode.
- Do not enable outbound, stage proposals, arbitrary edits or broad writes as
  incidental parts of this feature.

## Verification expectations

Backend tests should cover role/site/company/team scope, invalid and terminal
stage policy, conflicts, same-stage handling, successful committed state,
request-key replay, changed payload under the same key, receipt identity and
replay after permissions/scope change. Use isolated test data, not live records.

Frontend/gateway tests should cover exact allowlisting, malformed payloads,
forged/missing sessions, result identity, uncertain same-key replay, conflict and
auth errors, refresh behavior, invalid display-only drop targets, and parity
with existing search/filters/list/tray/Companion behavior. Include keyboard/touch
alternatives and no optimistic claim of committed success.

DreamOS commands (PowerShell; use Git Bash explicitly if `bash` is unavailable):

```powershell
npm.cmd run typecheck
# Run changed-file ESLint with node_modules/.bin/eslint.cmd.
npm.cmd run build
& 'C:/Program Files/Git/bin/bash.exe' tools/test-roster.sh
& 'C:/Program Files/Git/bin/bash.exe' tools/test-crm-domain.sh
& 'C:/Program Files/Git/bin/bash.exe' tools/test-companion.sh
& 'C:/Program Files/Git/bin/bash.exe' tools/test-hub-gateway.sh
```

Last completed baseline validation: **78 passing tests** (Roster/parity 15,
CRM 25, Companion 19, gateway 19), typecheck, changed-file lint, production build
and `git diff --check`. Browser verification was not run.

## Documentation and delivery

Update `docs/ROSTER-INTEGRATION.md` and `docs/LICENSE-MAP.md` if additional
original Roster behavior is migrated. Preserve all verbatim source snapshots
and hashes. Document the newly approved Hub contract in the backend and frontend
handoff/contract documentation rather than leaving it implicit in a UI handler.

Report what is implemented, what is genuinely committed by Odoo, which roles
may move leads, any blocked stage transitions, verification results and any
remaining live/manual testing. Do not describe review-task creation as a move.

Current drag-and-drop status: **not implemented**. Codex only investigated the
backend contract blocker and wrote this handoff; no stage write was enabled.
