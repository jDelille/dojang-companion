# License map

Where licensed template code in DreamOS came from. Required by the build handoff
(agent spec part 3 §71 and part 5 §17: "Record source in LICENSE-MAP.md").
Verbatim copies of the source files live in `vendor/licensed/` (see its README).

Process for each extracted component (part 5 §17): locate the licensed file,
record it here, copy only the needed logic, remove the vendor's router/state/data
layer, replace its theme with Dojang tokens, use typed props, keep it keyboard and
touch accessible.

## Base application

| DreamOS | Licensed source | Modified |
| --- | --- | --- |
| The whole app shell (`src/`, minus the Dojang files below) | Dreams Gym Facilities, Next.js variant (`Downloads\Dreams_Gym_Facilities\…\nextjs.zip`) | Yes: Dojang navigation, branding and tokens (`src/config/dojang.ts`, `src/style/css/dojang-shell.css`, sidebar/header) |

## Extracted components

The `roster-integration` experiment additionally preserves a selected **101-file
verbatim Roster 1.0.0 source snapshot** under `vendor/licensed/roster/source/`,
explicitly requested for source migration. Original location:
`C:\Users\justi\Desktop\Companion_Biz_Violoop\roster`. Every original path,
full SHA-256 and byte length is recorded in `SOURCE-MANIFEST.json` there.
See [ROSTER-INTEGRATION.md](./ROSTER-INTEGRATION.md) for the import boundary and
per-file adaptation record. The snapshot is never compiled or executed.

New source-derived runtime files:

| DreamOS | Roster original | Modified |
| --- | --- | --- |
| `src/templates/roster/components/pipeline/kanban.tsx` | `components/pipeline/kanban.tsx` | Original board/card rendering with typed real CRM props; now the `/crm` board with shared selection, tray/Companion context, tags/evidence and existing Sales controls. Read-only stage selector; removed vendor REST and optimistic/direct writes |
| `src/templates/roster/components/ui/{button.tsx,button-styles.ts,card.tsx,data.tsx,form.tsx,layout.tsx,overlay.tsx}` | Same seven paths under `components/ui/` | Relocated imports, Tailwind 4/DreamOS theme mapping, unused-import cleanup, ARIA spelling and modal scroll cleanup fixes |

`src/templates/roster/adapters/pipeline.ts`, its class-string helper, scoped CSS
and `/roster` host are DreamOS integration code. No new template backend runs.

| DreamOS file | Licensed source (package, path, SHA-256) | Taken | Modified |
| --- | --- | --- | --- |
| `src/views/inbox/inboxClient.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Two-pane list/detail layout (`lg:grid-cols-[330px_1fr]`, panes capped at `calc(100vh-15rem)`), filter tabs with counts, first-row auto-select, `?conversation=` deep link (here `?message=`), empty/loading/error placement | Yes: Hub `context` read via `/api/hub`, filters are Hub-state based (Needs you / Replied / All), no Prisma, auth, polling, send box or Close/Reopen, Dojang tokens |
| `src/views/inbox/inboxList.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Conversation-row pattern (name, channel, Needs-you badge, one-line preview via `truncate`, `aria-current`), channel icon map | Yes: each row is one Hub message work item (no conversation model), distinct SMS/WhatsApp icons and labels, Hub state/delivery badges, no time (the Hub read has none) |
| `src/views/inbox/messageView.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Detail header (name, link to record, channel line) and inbound message bubble | Yes: one inbound message (no thread); actions are Companion's Hub workflow, not Roster's direct send |
| `src/views/inbox/inboxStates.tsx` | Roster 1.0.0, `components/ui/layout.tsx` (`d9fdb45b…8a4635`) `Tabs`, `LoadingBlock`, `ErrorBlock`; `components/ui/data.tsx` (`0e5aa179…f224`) `Badge`, `EmptyState` | Tab bar semantics (tablist, arrow keys, counts), loading/empty/retryable-error blocks, badge shape | Yes: Dojang tokens, no `cn`/`Button` dependencies |
| `src/views/doForMe/useAgentConversation.ts` | Roster 1.0.0, `components/agents/test-chat.tsx` (`c9017459…ae629f7`) | Conversation state machine: staff turn plus empty agent turn filled by tokens, `replaceLast`, abort on unmount, SSE frame parsing, the `finished` flag and its "stopped early" / "connection dropped" endings, reset | Yes: one conversation per Do For Me focus (mounted by focus key), typed history only, quick asks answered from the rail context, no agent id, conversation id or next-intl |
| `src/views/doForMe/agentConversation.tsx` | Roster 1.0.0, `components/agents/test-chat.tsx` (`c9017459…ae629f7`) | Thread with `aria-live`, scroll-to-newest, "thinking…" placeholder, error line under a turn, New conversation (here Clear) | Yes: rail composer, quick asks, source label per answer, "Review" opens the governed review, Dojang tokens, no Roster `ui` kit |
| `src/app/api/companion/ask/route.ts` | Roster 1.0.0, `app/api/agents/[id]/chat/route.ts` (`bd2b4fd7…a643f0`) | SSE response protocol (`meta`, `token`, `error`, `done`), headers | Yes: no Prisma conversation/message rows or vendor auth; existing sealed Hub staff authentication, strict body check, one whole `companion_ask` answer adapted to token/done; real errors preserve HTTP status |
| `src/server/companion-agent.ts`, `src/domain/companionAgent.ts` | Roster 1.0.0, `lib/ai/adapter.ts` (`5ab754ba…ea1bb5a8`), `lib/ai/index.ts` (`b72d1af9…836354e5`) | Provider-agnostic stream contract (`StreamChunk`, `AiProviderAdapter`, `streamAgentReply` shape) | Yes: no model SDKs, keys, usage metering or prompt builder; the provider is meant to be the Hub, and none is connected |
| `src/domain/workflow/definition.ts` | Roster 1.0.0, `lib/retention-shared.ts` (`060ae039…dabdebed`), `lib/retention.ts` (`f1583511…196edf3e`) | Step shape (action, `delayMinutes`, skip branch), `renderTemplate` `{{field}}` syntax, `formatDelay` | Yes: steps name governed capabilities, conditions are named checks over Hub facts, missing fields block (no "there" fallback), versioned definitions, manual trigger only |
| `src/domain/workflow/actions.ts` | Roster 1.0.0, `lib/retention-shared.ts` `ACTION_LABELS`, `lib/retention.ts` `executeStep` | The list of step actions, mapped one by one to Dojang capabilities | Yes: no sends or Prisma writes; one capability bound to the Hub's `prepare_lead_action`, the rest declared not connected with the contract needed |
| `src/domain/workflow/run.ts`, `src/domain/workflow/engine.ts` | Roster 1.0.0, `workers/retentionSender.ts` (`297267fb…7f24b88`), `prisma/schema.prisma` (`77699ab5…dd78cd3e`) `RetentionRun`, `lib/retention.ts` dry run / `describeStep` | One step per tick, active-rule check, step log, next step after its delay, dry run that describes instead of acting | Yes: pure functions (no BullMQ/Prisma), prepare then staff approval, uncertain never auto-retried (same key on explicit retry), blocked status, version pinning |
| `src/domain/workflow/store.ts` | Roster 1.0.0, `prisma/schema.prisma` `RetentionRule`/`RetentionRun` (`@@unique([ruleId, contactId])`) | The one-run-per-subject rule | Yes: interface only, no persistence chosen |

Full SHA-256 of the copies in `vendor/licensed/roster/`:

```
bcf85495571f2c13604886e5a68af49be213373755e01146bc964ea7b7c9945e  components/inbox/inbox-client.tsx
d9fdb45b4e4d554eec26ce77cb2eec2276023516b32cb8978e5e16699f8a4635  components/ui/layout.tsx
0e5aa1794a896a45becfedbc511ab616bacdaca19d394bd3b7f47c93b032f224  components/ui/data.tsx
c9017459cdfde1e2da86bb42b1bd1f2bd4feef233d461d93f267a1988ae629f7  components/agents/test-chat.tsx
bd2b4fd7c8f46a7a3c47a6a196fd88478d8568a062dc690bd4aba51586a643f0  app/api/agents/[id]/chat/route.ts
5ab754bace36a1c91c6bbc3e37e76ef6d2b183d417af4d3f76027061ea1bb5a8  lib/ai/adapter.ts
b72d1af97028de9ebeb97e3391ac2588657958395b4da9d6ade5f5ac836354e5  lib/ai/index.ts
f15835111e84e8bca11203eae759e8f3e792884a5d8128c467fea230196edf3e  lib/retention.ts
060ae039bd05e943a0502a6851588de54538f27748c277611e80c2a0dabdebed  lib/retention-shared.ts
297267fb9a21da61102f7c4509bd9f177c047fd5a617de6609f3665157f24b88  workers/retentionSender.ts
77699ab5da36fb3bdd09b1999f6cf0de1505abae06720a5cec921069dd78cd3e  prisma/schema.prisma
```

Not taken from Roster (deliberately): `app/api/inbox/*` (Prisma, `requireWorkspace`),
`/api/inbox/send` (direct Twilio/WhatsApp/email send), `lib/credentials.ts`,
`lib/integrations/*`, the 15-second polling, Close/Reopen, `useToast`, next-intl.

## Not licensed (Dojang's own code, for the record)

Ported by meaning from Dojang's Companion repository (`jDelille/companion` @ 1cab554b),
not a licensed template: Member 360, kiosk, Do For Me rail, follow-up/inbox workflow
(`app/(companion)/hub/page.tsx` MessageCard). Hub contracts follow Jodi's
`dojo_companion_hub` (dojo-odoo19, 16 Oct 2026). Each file names its source in a comment.
