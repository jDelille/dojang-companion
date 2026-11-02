# Companion CRM implementation

This records the earlier read-integration pass. The subsequent authorized task
completion and internal-note implementation is described in
[CRM internal actions](./CRM-INTERNAL-ACTIONS.md).

Implemented against the existing DreamOS contracts. No new Hub operations or
write permissions were enabled.

## Demonstration

1. `/crm`: search a lead or contact name. This uses `crm_context` through the
   existing CRM integration, not a search of only the initially loaded 100 leads.
   Combine owner, stage, source and tag filters; choose overdue, due today or
   needs-follow-up evidence; switch board/list or sort by priority/name.
2. Select a lead: the tray and Companion show that record's authoritative
   evidence. Open its workspace to see tasks, notes and receipt activity.
3. For an eligible lead, Review follow-up opens the existing governed review.
   Apply uses `prepare_lead_action`; its existing conflict, uncertain-result,
   same-key retry and receipt behavior remains intact. No message is sent.
4. `/people/<id>`: Training, Bookings, Attendance, Membership and the
   attendance-only Timeline use `member_details`. Contact fields appear only
   when that read supplies them. Missing/role-hidden contacts are not guessed.
5. `/front-desk`: open a task's canonical lead/member, use quick navigation,
   select a guardian request and open that exact message in Inbox while keeping
   its authoritative member binding visible.

Fixture banners and development-only data remain. Returned list counts are
qualified when capped; incomplete zero attendance/bookings is unknown.

## Boundaries and remaining dependencies

- `create_task`, `add_lead_note`, `complete_task`, `create_lead`, `update_lead`,
  `assign_lead` and `propose_stage` remain outside the gateway allowlist. Named
  operations alone are insufficient: payload/result schemas, grants, versions,
  idempotency and approval behavior must be verified before exposing them.
- `member_workspace`, `instructor_context`, `attendance_sessions`,
  `billing_ledger` and `waiver_context` are not forwarded by DreamOS today.
  Family, payments, messages, documents, notes and safety are not manufactured.
  Safety specifically still requires established role/privacy rules.
- The timeline is explicitly attendance-only, not a complete person history.
- Typed AI answers remain disconnected. Existing deterministic quick asks and
  fixed-rule evidence remain labelled accordingly.
- Phone/email links open external device apps; these are not WhatsMax sends.
- No live Odoo writes, outbound sends, or browser automation were performed for
  verification. A manual live/staging pass remains necessary.

## Verification

CRM domain/integration tests: `bash tools/test-crm-domain.sh` (13 tests), including
real parser checks with fake Hub answers, identity mismatch, malformed booking
dates, unavailable search, fixture isolation and exact/unknown zero semantics.
Existing gateway, workflow and kiosk suites were also run (10, 17, 69 tests).
Typecheck and production build passed during implementation. Full ESLint found
existing errors in `src/style/icons/lucide/lucide.min.js` and
`src/views/main-pages/pages/error500.tsx`; these unrelated files were not edited.

## Files in this sprint

New:

- `src/app/(main)/crm/loading.tsx`
- `src/domain/leadOrganization.ts`, `src/domain/memberReadPresentation.ts`
- `src/views/people/memberSections.tsx`, `src/views/frontDesk/crmAttention.tsx`
- `tests/crm/organization.test.cjs`, `tests/crm/reads.test.cjs`, `tests/crm/tsconfig.json`
- `tools/test-crm-domain.sh`, `docs/CRM-SPRINT.md`

Updated:

- `src/app/(main)/crm/page.tsx`, `src/app/(main)/crm/leads/[id]/page.tsx`
- `src/domain/member.ts`, `src/integrations/crm.ts`, `src/integrations/member.ts`
- `src/views/crm/salesPipeline.tsx`, `leadViews.tsx`, `leadTray.tsx`,
  `leadDetail.tsx`, `followUpPanel.tsx`
- `src/views/people/member360.tsx`
- `src/views/frontDesk/frontDesk.tsx`, `frontDeskRail.ts`, `activeContext.tsx`

Existing uncommitted Companion conversation/workflow and vendor changes were
preserved; they were not implemented by this sprint.
