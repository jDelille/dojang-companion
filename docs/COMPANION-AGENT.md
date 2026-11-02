# Companion agent: what's built and what the Hub needs

Status 2026-11-02. `companion_ask` is now a verified Jodi Hub read, wired through
the existing sealed staff session. This document supersedes the earlier proposed
payload; no lead context or conversation history is accepted by Jodi.

## Built in DreamOS (Roster-derived conversation runtime)

| Piece | File | Roster source |
| --- | --- | --- |
| Conversation types, SSE event protocol, quick-ask answers | `src/domain/companionAgent.ts` | `lib/ai/adapter.ts`, chat route events |
| Authenticated Hub answer adapter (`agentProvider(staff.read)`) | `src/server/companion-agent.ts` | `AiProviderAdapter`, `streamAgentReply` |
| `POST /api/companion/ask` (SSE, strict body) | `src/app/api/companion/ask/route.ts` | `app/api/agents/[id]/chat/route.ts` |
| Conversation state per rail focus | `src/views/doForMe/useAgentConversation.ts` | `components/agents/test-chat.tsx` |
| Rail "Ask the agent" UI | `src/views/doForMe/agentConversation.tsx` | `components/agents/test-chat.tsx` |

What works today:

- The bottom quick-ask pills and activation banner were removed at the user's
  request. Fixed-rule lead evidence and governed follow-up review remain.
- **Review** on an answer opens the same governed review as Do For Me. Nothing
  is applied from the conversation.
- **Typed questions** go to `/api/companion/ask`, which validates the request and
  authenticates the sealed Hub staff session before constructing the adapter.
  Jodi answers whole; DreamOS emits metadata, one answer token, and done.
- Conversations are per focus key and vanish when the focus changes, the rail
  closes or staff sign out.

Not taken from Roster on purpose: direct Claude/OpenAI calls with an app-held key,
Prisma conversation/message rows, workspace RBAC, the persona/knowledge-base prompt
builder, usage metering, public widget, Twilio voice webhooks.

## Verified Hub read `companion_ask`

Odoo owns the prompt, scoped facts, model choice, AI switches, cost and audit.
`requireHubStaff()` reuses the existing cookie verification and returns a
server-only read closure, not credentials. `readHubAsStaff` uses the same helper.

```text
operation: "companion_ask"   (read: requestKey null)
payload:   { question, memberId: string|null, sessionId: string|null }
result:    { answer, mode: "AI explanation of scoped Odoo data - no actions executed",
             focus: { kind: "member"|"session"|"site", id: string|null } }
errors:    AI_DISABLED (409), AI_UNAVAILABLE (503), INVALID_COMMAND (400),
           MEMBER_UNAVAILABLE / SESSION_UNAVAILABLE (404), FORBIDDEN (403)
```

Exact payload validation is applied to browser and server paths. The question
must be trimmed and 1–500 characters; at most one ID is non-null. Reads use a
null request key. No writes were added. Returned focus must match the request;
malformed or mismatched answers are withheld as HUB_RESPONSE_UNREADABLE.

Member 360 and a selected Front Desk member use `member:<id>`. General workspace
questions use null/null and display a site-level label. Session UI integration is
deferred. `lead:<id>` and `sales:<id>` fail with LEAD_AI_UNSUPPORTED before any Hub
call. Message/unknown record focuses are likewise explicitly unsupported.

History remains in the browser thread; compatibility history sent to DreamOS
is not forwarded, summarized into the question, or treated as trusted facts.
The current client sends an empty history array.
Each question is answered independently. Authentication failure clears the rail,
persisted tabs and perspective, marks the shell signed out, unmounts sensitive
workspace content, and refreshes the server session view.

Tests: `bash tools/test-companion.sh` (route, authentication, errors, whole-answer
events, rendering, focus/scroll unit tests); `bash tools/test-hub-gateway.sh`
(allowlist, exact companion payload and request-key validation).

Deployment still needs the supplied Jodi operation, working staff grants,
both backend AI switches and Jodi provider configuration. No live AI/provider
call or browser automation was performed during this frontend implementation.

### Files in the Hub wiring pass

- Boundary/contracts: `src/domain/companionHub.ts`, `src/domain/companionAgent.ts`,
  `src/server/hub-gateway.ts`, `src/server/companion-agent.ts`,
  `src/app/api/companion/ask/route.ts`.
- Member context: `src/domain/memberCompanion.ts`, `src/integrations/companion.ts`,
  `src/views/frontDesk/frontDesk.tsx`, `src/views/frontDesk/activeContext.tsx`.
- Experience: `src/views/doForMe/useAgentConversation.ts`, `agentConversation.tsx`,
  `agentAnswerContent.tsx`, `doForMeProvider.tsx`, `revealCompanion.ts`,
  `src/views/shell/dojangShell.tsx`, `src/domain/doForMeActivation.ts`.
- Tests: `tests/companion/ask.test.cjs`, `presentation.test.cjs`, `tsconfig.json`,
  `tools/test-companion.sh`, `tests/hub-gateway/gateway-allowlist.test.cjs`,
  `tests/crm/do-for-me.test.cjs`.
- Documentation: this file and `docs/LICENSE-MAP.md`.

## Later Roster capabilities and the contracts they need

| Roster capability | Roster source | Hub/backend contract needed |
| --- | --- | --- |
| AI staff (persona, tone, channels, escalation rules) | `lib/ai/prompt.ts`, `lib/ai/index.ts` `shouldEscalate`, `components/agents/*` | Agent configuration owned by Odoo per site, read by a Hub op |
| Retention playbooks (trigger, steps, delays, skip-if-replied, dry run, run log) | `lib/retention.ts`, `lib/retention-shared.ts`, `workers/retentionSender.ts` | Engine built (pure, tested): see `docs/WORKFLOW-ENGINE.md`. Still needs persistence owner, scheduler, approvals UI, and contracts for every capability except `prepare_lead_action` |
| Inbox AI draft | chat route used by the inbox composer | Hub `draft` exists in Odoo; DreamOS gateway still refuses it (needs approval to forward) |
| Lead gathering (Google Places) | `workers/leadGather.ts`, `lib/integrations/googleMaps.ts` | Odoo `crm.lead` create with dedupe, consent and source policy |
| Bookings / reminders | `lib/integrations/calendar.ts`, `workers/reminderScheduler.ts` | Trial/session booking write via Hub; reminder via WhatsMax delivery queue |
| Invoicing / payments | `components/invoices/*`, Stripe/Paystack webhooks | Odoo `account.move` reads and a governed payment-link capability |
| Reputation (review requests, AI reply drafts) | `components/reviews/*`, `UTILITY_PROMPTS.reviewResponse` | Review source integration plus outbound via WhatsMax with consent |
| Call summaries / voice agent | `app/api/voice/*`, `UTILITY_PROMPTS.callSummary` | Telephony through WhatsMax/Connect; summary written to Odoo as a note |
