<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.



# Dojang — Agent Context

## Purpose

This repository is the current target application for the Dojang / 1Club product.

It is being built by adapting an existing Dreams Gym Next.js template into the Dojang staff, CRM, kiosk, communications, and AI-assisted operations experience.

Do not treat the original Dreams template as the product specification.

When implementation details conflict, preserve the Dojang architecture and explicitly identify unresolved decisions rather than inventing behavior.

---

# 1. Product Architecture

The intended high-level product model is:

```text
                    DOJANG OPERATIONS OS

                           |
        -----------------------------------------
        |                  |                    |
   STAFF PORTAL          KIOSK             MEMBER APP
        |
        |-- People / Member 360
        |-- Sales / CRM
        |-- Inbox
        |-- Operations
        |-- Do For Me / AI Companion
```

Paul's architectural direction is:

- WhatsMax becomes the communications experience / omnichannel event fabric.
- Odoo remains the authoritative business and operations record.
- The Federated Operations Platform remains the security/policy/control plane.
- The AI Companion becomes the universal interaction layer.

Templates may accelerate implementation, but their internal schemas and backend architectures must not silently become the permanent Dojang architecture.

---

# 2. Source Responsibilities

There are several important sources in this project. They have different responsibilities.

## Dreams

This `nextjs` repository originated from the Dreams Gym template.

Dreams provides:

- Next.js application structure
- responsive shell
- navigation mechanics
- generic tables
- cards
- forms
- layouts
- chart areas
- reusable UI infrastructure

Dreams is a FOUNDATION, not the product authority.

Do not assume an existing Dreams route, database concept, workflow, role, or gym feature belongs in Dojang simply because it exists in the template.

Many original Dreams routes still physically exist but are hidden from normal Dojang navigation.

The final application should not look or behave like an untouched Dreams demo.

---

## Companion

The separate Companion project contains existing Dojang implementations and reference behavior.

Companion is an important reference for:

- Hub contracts
- kiosk domain logic
- Member 360 behavior
- Do For Me behavior
- CRM workflows
- Inbox / MessageCard workflow
- request/receipt behavior
- approval flows
- idempotency behavior
- error handling

Companion is generally a SOURCE/REFERENCE project.

The target product is this `nextjs` repository.

Do not modify Companion unless explicitly instructed.

Do not blindly copy Companion UI. Preserve its important domain behavior/contracts while adapting the experience into the current Dojang application.

---

## Jodi's designs, specs and handoff

Jodi's material is the primary product/workflow/design authority where it provides an explicit answer.

Important concepts include:

- session-first kiosk/check-in
- Member 360
- CRM workflows
- Inbox/communications
- AI Companion / Do For Me
- controlled Hub/Odoo integration
- explicit evidence and state
- governed actions rather than arbitrary frontend mutations

Do not silently resolve something Jodi left unspecified.

Unknown requirements should remain explicit unknowns.

---

## Roster

Roster is a licensed template/reference used selectively for useful interaction patterns.

Useful Roster concepts include:

- contacts
- leads
- pipeline / Kanban
- tasks
- activity/timeline
- Inbox layout
- communication presentation
- automations
- agent/AI UI concepts

Do NOT import Roster's backend architecture.

Specifically avoid adopting:

- Prisma as Dojang's authoritative database
- Roster/vendor authentication
- vendor RBAC
- prospecting-specific schema
- direct provider sends
- direct backend writes
- duplicate application routing/backend architecture

Reuse/adapt components and interaction patterns only where appropriate.

Any copied licensed source must remain traceable through the project's license mapping.

---

# 3. System of Record

Odoo is the authoritative business and operations record.

The frontend must not create a parallel authoritative database or silently manufacture business facts.

Examples of authoritative information include:

- members
- leads
- sessions/classes
- attendance
- membership state
- rank
- billing
- activities/tasks
- operational state

The UI should display what authoritative services provide and clearly distinguish unavailable data from confirmed empty/zero values.

---

# 4. Hub Boundary

The intended application flow is approximately:

```text
UI / Experience
      |
      v
BFF / Domain Service
      |
      v
Hub / Odoo Domain Adapter
      |
      v
Odoo
      |
      v
Events / Companion / Communications
```

The UI owns:

- adaptive screens
- current selection
- forms
- readable results
- presentation of permitted actions

The UI must NOT own:

- privileged credentials
- arbitrary Odoo ORM access
- authoritative business rules
- a second authoritative database

The BFF/server layer should:

- authenticate the actor
- derive trusted actor/site/scope
- validate requests
- authorize allowlisted actions
- normalize errors

Never trust tenant, role, actor, site, or scope merely because the browser sent it.

Odoo owns:

- authoritative records
- business rules
- transactions
- concurrency
- duplicate protection
- committed success

Do not report success before authoritative commit.

---

# 5. Authentication

Real Hub/Odoo access uses the staff member's own Odoo account.

Current DreamOS behavior:

1. User signs in through DreamOS.
2. Credentials are sent to Odoo authentication once.
3. Password is never stored.
4. Server verifies the account can access the configured Dojang site.
5. Odoo session information is sealed into an HttpOnly, SameSite=Strict application cookie.
6. Browser code does not receive privileged Odoo credentials/session secrets.

Do not create a second authentication system for People, CRM, Inbox, or other staff surfaces.

All real staff surfaces should eventually share this authenticated session.

Authentication loss must also clear/suppress sensitive UI context.

Never leave member/lead/message information visible after logout simply because a client context or browser cache survived.

---

# 6. Fixture vs Real Data

This rule is critical.

When Hub mode is enabled:

**Never silently mix fixture data with real Odoo data.**

If Odoo is unavailable, authentication expires, a response is malformed, or a field is unsupported:

- show an honest unavailable/error/empty state
- do not substitute development fixtures
- do not manufacture a plausible value

Fixture mode remains useful as an explicit development/test mode.

The user should always be able to distinguish:

- confirmed zero
- confirmed empty
- unsupported field
- unavailable read
- malformed response
- development fixture

These are not equivalent states.

---

# 7. Current Real Odoo Integration

The application has begun migrating from fixtures to real Hub/Odoo reads.

## Inbox

Real Hub/Odoo read integration exists.

Current real flow:

```text
DreamOS Inbox
      |
DreamOS server
      |
/companion/hub/action
      |
Jodi Hub
      |
Odoo
```

Inbox can render real Hub messages after staff authentication.

Hub mode is intentionally read-only in DreamOS at this stage, with one explicit exception: the gateway (`src/server/hub-gateway.ts`, `FORWARDED_ACTIONS`) forwards a single write, `prepare_lead_action` with `kind: "follow_up"` and exactly `{ leadId, expectedVersion, kind, reason, due }` plus a request key, which creates one internal follow-up task on the lead (see section 11). Every other write (including Inbox resolve/draft/approve_reply) is refused with `HUB_READ_ONLY` before it reaches Odoo.

Do not enable resolve/draft/approve/send simply because corresponding UI or fixture behavior exists.

---

## People

People now supports real Odoo reads in Hub mode.

Current list read:

`context`

Relevant member list shape:

```text
{
  id,
  name,
  version,
  state,
  rank
}
```

Known states include:

- lead
- trial
- active
- paused
- cancelled

Rank may be "Unassigned".

---

## Member 360

Real Member 360 uses:

`member_details`

with:

```text
{
  memberId
}
```

Known returned information includes:

### member

- id
- name
- version
- partnerVersion
- phone
- email
- dateOfBirth
- photo
- state
- rank
- stripes

Some contact information is role restricted.

### bookings

- id
- sessionId
- title
- startsAt
- attendanceState
- replaceable

### attendance

- id
- sessionId
- title
- checkedInAt
- checkedOutAt

The read may additionally provide:

- rankHistory
- ranks
- courses
- billing
- canEdit
- limits

Not all of those are wired into the UI yet.

Never infer unsupported Member 360 facts from unrelated data.

Known unsupported/unavailable fields currently include concepts such as:

- authoritative attendance percentage
- lifetime class count
- join date
- program
- primary instructor
- team
- home location
- testing readiness

Do not label an unsupported integration field as though Odoo explicitly recorded "none".

---

# 8. Member Workspace

A `member_workspace` Hub capability exists and may expose areas such as:

- household
- safety
- documents
- messages
- timeline

It is NOT fully integrated yet.

Be especially careful with Safety.

Safety may contain sensitive medical/allergy information.

Do not automatically expose that information merely because the API returns it.

Role visibility and product requirements must be established first.

---

# 9. Inbox Identity

Inbox member links must use authoritative member identity.

Current intended relationship:

```text
Hub message.memberId
        |
        v
/people/<memberId>
        |
        v
member_details(memberId)
```

Do not match people by name.

Do not use a household fallback to guess identity.

Do not allow a returned member record with a different ID to silently render under the requested URL.

---

# 10. Sales / CRM

Sales and Lead Detail currently remain primarily development fixtures.

The next intended integration is READ-ONLY real CRM data through existing Hub/Odoo contracts.

Do not enable CRM writes merely while connecting reads.

Known current CRM experience includes:

- board/list pipeline
- owner/program filters
- lead detail
- next action
- timeline/notes
- trial information
- Member 360 relationship where known

Known product questions include:

- lost lead handling
- exact next-action semantics
- household/partner linkage
- source of program information

Do not invent answers to those questions.

---

# 11. CRM Follow-Up Action

Companion/Jodi architecture includes a governed CRM follow-up preparation action.

Known operation:

`prepare_lead_action`

Example conceptual payload:

```text
{
  leadId,
  expectedVersion,
  kind: "follow_up",
  reason,
  due
}
```

This creates an INTERNAL follow-up/task.

It does NOT imply:

- SMS sent
- WhatsApp sent
- email sent
- trial booked
- membership created

A prepared CRM follow-up must never be represented as an outbound communication.

---

# 12. WhatsMax

WhatsMax is the communication/provider ecosystem.

It should sit behind the Dojang communications experience rather than becoming a separate embedded application.

WhatsMax owns/provider-side concerns such as:

- communication channels
- provider credentials
- contacts
- conversations
- provider sends

Odoo/Hub owns or governs:

- verified bindings
- business context
- drafts
- approvals
- delivery queue/state
- consent/policy
- staff role/scope
- audit

Do not directly read WhatsMax's database from DreamOS/Odoo.

Use approved service boundaries.

---

# 13. Outbound Messaging

Outbound messaging is intentionally constrained.

There is an existing governed guardian-reply workflow for inbound verified-guardian messages.

Conceptually:

```text
Inbound WhatsMax message
      |
verified Hub/Odoo context
      |
staff resolves context
      |
draft
      |
staff review
      |
approve_reply
      |
delivery queue
      |
WhatsMax provider send
      |
delivery status
```

Important:

**CRM lead outbound messaging is NOT currently established by the known Hub contract.**

`prepare_lead_action` creates an internal task only.

Do not invent a lead SMS/WhatsApp send path.

Do not enable live outbound messaging without explicit approval/configuration.

---

# 14. Delivery Semantics

Known delivery concepts include:

- queued
- dispatching
- accepted
- delivered
- failed
- uncertain
- cancelled

Accepted is NOT equivalent to delivered.

Network uncertainty must not automatically become a retry.

Never automatically resend an uncertain outbound communication.

Idempotency and request identity must be preserved.

---

# 15. Kiosk

The kiosk experience exists under:

`/kiosk`

and is intentionally separate from the normal staff workspace.

Current flow:

```text
Welcome
  ->
Choose live session/class
  ->
Identify student
  ->
Resolve/select if needed
  ->
Check eligibility
  ->
Confirm
  ->
Record attendance
  ->
Result
  ->
Privacy reset
```

This follows Jodi's session-first approach.

The kiosk should not begin with a global member lookup when a live session can establish the operational context first.

Current DreamOS kiosk includes substantial UI/domain behavior but still relies on development/mock attendance APIs.

Do not mistake the existence of the kiosk UI for completed production

16. Attendance Command

The intended attendance action is governed and idempotent.

Conceptually:

attendance.checkIn

with information similar to:

{
  sessionId,
  memberId,
  identificationProof
}

and command metadata such as:

idempotencyKey

correlationId

expectedVersion where appropriate

Trusted server context should derive:

authenticated actor/device

organization

location

verified relationship/scope

Possible authoritative result states include:

confirmed

already_recorded

rejected

Network-unknown/pending state must remain distinct from server-confirmed success.

Do not enable production attendance writes casually.

17. Do For Me / AI Companion

Do For Me is not merely a chatbot.

It is intended to become a contextual action/review layer across Dojang staff surfaces.

It may use current context such as:

member

lead

message

operational task

Useful behavior includes:

explain

summarize

identify relevant evidence

propose actions

prepare governed actions

show what will change

show what will NOT change

request explicit approval where required

show receipts/history

AI output is never authoritative business state.

Do For Me must not:

broaden permissions

silently send communications

silently alter billing

silently alter rank

fabricate backend capabilities

pretend a proposal was executed

retain sensitive record context after authentication/context is lost

The current implementation is a shared Do For Me experience across multiple staff surfaces, but it should not be described as a completely finished universal AI Companion yet.

18. Do For Me Action Pattern

Prefer:

Suggestion
    |
Evidence
    |
Review
    |
Explicit action
    |
Authoritative service
    |
Receipt/result

over:

AI decides
    |
frontend mutates data

The first is aligned with the intended architecture.

The second is not.

19. Current Staff Navigation

The current primary Dojang navigation is:

People

Sales

Inbox

Kiosk

/ currently redirects to /people.

This may not be the final information architecture.

There is a Jodi Today/Ops concept and other possible staff surfaces.

Do not assume /people must permanently remain the product home page merely because it is today's redirect.

20. Visual Authority

The final UI should move away from generic Dreams styling toward Dojang/Jodi's visual language.

Known product tokens include approximately:

canvas: #08080a

panel: #101014

primary text: #f6f6f8

brand red: #e8192c

gold: #d7b75c — reserve primarily for mastery/testing

violet: #8a7cf6 — reserve primarily for AI context

Do not randomly use semantic colors where they conflict with the established visual language.

When mockups exist, compare implementation against the mockups rather than assuming Dreams' original component appearance is correct.

21. Template Extraction Rules

Reuse templates by extraction/adaptation, not by preserving entire template applications.

For useful template components:

Identify useful source component.

Preserve required licensing/source traceability.

Remove demo data and template-specific backend assumptions.

Remove duplicate auth/routing.

Adapt inputs to typed Dojang/domain data.

Centralize loading/error behavior.

Wire only to named/approved domain actions.

Review keyboard/touch/responsive behavior.

Do not preserve template behavior solely because it already works.

22. Data Honesty

This is a core implementation principle.

Never convert uncertainty into certainty.

Examples:

Bad:

malformed booking response → "0 upcoming bookings"

truncated history → exact lifetime/weekly total

unsupported field → "Not recorded"

network uncertainty → "Failed" followed by automatic retry

fixture fallback after Odoo error

accepted provider request → "Delivered"

Better:

"Unavailable"

"Not provided by this read"

qualified/truncated count

explicit uncertain state

honest authentication/error screen

delivery state exactly as authoritative service reports

23. Security and Privacy

Treat record visibility seriously.

At minimum:

clear/suppress record context after logout

scope browser persistence to the authenticated context or clear it

never expose previous staff user's record names after session change

verify requested record identity against returned record identity

do not expose sensitive safety/medical data without explicit role/product rules

do not expose Odoo credentials/session secrets to browser code

preserve site/grant enforcement

Do not weaken security simply to make development easier.

24. Current Implementation Status

As of the current integration phase:

Real / partially real

Inbox

real Hub/Odoo reads

authenticated

real messages

writes disabled

People

real Hub/Odoo list read

authenticated

fixture mode remains available explicitly

Member 360

real member_details read

core real fields displayed

several tabs/fields not connected

Still fixture / incomplete backend

Sales / CRM

fixtures

Lead Detail

fixtures

Kiosk

substantial real UI/domain flow

attendance backend remains development/mock

Do For Me

shared contextual UI exists

some behavior remains fixture/read-only depending on surface

Writes

Real DreamOS Hub writes are intentionally not broadly enabled yet.

Outbound

Live outbound communication remains intentionally disabled/not configured for the current DreamOS integration.

25. Known Near-Term Work

Likely progression:

Stabilize/review real People and Member 360 reads.

Connect Sales pipeline to real CRM/Odoo reads.

Connect Lead Detail to real CRM/Odoo reads.

Consider additional Member Workspace reads after role/privacy decisions.

Only then enable individual real writes deliberately, one capability at a time.

Production attendance integration requires its own careful pass.

Outbound messaging requires explicit provider/policy/test configuration.

Do not skip directly from read integration to broad write access.

26. Agent Working Rules

When working in this repository:

Always

inspect existing implementation before changing it

preserve Hub/Odoo authority

preserve authentication/site/grant enforcement

preserve idempotency/version semantics

distinguish real data from fixtures

report unsupported requirements honestly

prefer small, reviewable changes

run relevant typecheck/lint/tests/build after meaningful changes

explain which contracts were used

report assumptions and unresolved decisions

Never without explicit instruction

commit

push

modify Companion

enable production outbound messaging

enable broad Odoo writes

invent new Hub contracts

create a second authoritative database

silently fallback from real Odoo to fixtures

weaken authentication or role checks

expose privileged credentials to the browser

invent missing member/lead/business facts

automatically retry uncertain outbound actions

perform unrelated template cleanup

Browser automation

Do not run browser automation unless explicitly requested.

The developer will perform manual browser testing when appropriate.

27. Working With Other Agents

Another coding agent may be working on this project at the same time.

Avoid overlapping edits.

Before making a substantial change:

inspect the current files

assume another agent may have recently modified them

do not overwrite unfamiliar recent work

keep work scoped to the requested area

A useful workflow is:

Agent A implements
      |
Agent B reviews
      |
Agent A fixes
      |
Agent B verifies

rather than two agents simultaneously implementing the same feature.

28. Decision Rule

When uncertain, prefer this order:

Explicit Jodi specification/handoff

Existing approved Hub/Odoo contract

Existing Companion domain behavior

Current Dojang product decisions

Adapted template interaction pattern

Ask/report unresolved requirement

Do not use a convenient Dreams or Roster behavior to override an established Dojang domain rule.

29. Definition of Good Work

A successful change should not merely make the UI look functional.

It should preserve the chain:

Correct identity
    +
Correct authority
    +
Correct permissions
    +
Honest data
    +
Explicit state
    +
Governed action
    +
Authoritative result

If the backend does not support something yet, representing that limitation honestly is preferable to making the product appear more complete with fake behavior.

<!-- END:nextjs-agent-rules -->