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

| DreamOS file | Licensed source (package, path, SHA-256) | Taken | Modified |
| --- | --- | --- | --- |
| `src/views/inbox/inboxClient.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Two-pane list/detail layout (`lg:grid-cols-[330px_1fr]`, panes capped at `calc(100vh-15rem)`), filter tabs with counts, first-row auto-select, `?conversation=` deep link (here `?message=`), empty/loading/error placement | Yes: Hub `context` read via `/api/hub`, filters are Hub-state based (Needs you / Replied / All), no Prisma, auth, polling, send box or Close/Reopen, Dojang tokens |
| `src/views/inbox/inboxList.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Conversation-row pattern (name, channel, Needs-you badge, one-line preview via `truncate`, `aria-current`), channel icon map | Yes: each row is one Hub message work item (no conversation model), distinct SMS/WhatsApp icons and labels, Hub state/delivery badges, no time (the Hub read has none) |
| `src/views/inbox/messageView.tsx` | Roster 1.0.0, `components/inbox/inbox-client.tsx` (`bcf85495…c9945e`) | Detail header (name, link to record, channel line) and inbound message bubble | Yes: one inbound message (no thread); actions are Companion's Hub workflow, not Roster's direct send |
| `src/views/inbox/inboxStates.tsx` | Roster 1.0.0, `components/ui/layout.tsx` (`d9fdb45b…8a4635`) `Tabs`, `LoadingBlock`, `ErrorBlock`; `components/ui/data.tsx` (`0e5aa179…f224`) `Badge`, `EmptyState` | Tab bar semantics (tablist, arrow keys, counts), loading/empty/retryable-error blocks, badge shape | Yes: Dojang tokens, no `cn`/`Button` dependencies |

Full SHA-256 of the copies in `vendor/licensed/roster/`:

```
bcf85495571f2c13604886e5a68af49be213373755e01146bc964ea7b7c9945e  components/inbox/inbox-client.tsx
d9fdb45b4e4d554eec26ce77cb2eec2276023516b32cb8978e5e16699f8a4635  components/ui/layout.tsx
0e5aa1794a896a45becfedbc511ab616bacdaca19d394bd3b7f47c93b032f224  components/ui/data.tsx
```

Not taken from Roster (deliberately): `app/api/inbox/*` (Prisma, `requireWorkspace`),
`/api/inbox/send` (direct Twilio/WhatsApp/email send), `lib/credentials.ts`,
`lib/integrations/*`, the 15-second polling, Close/Reopen, `useToast`, next-intl.

## Not licensed (Dojang's own code, for the record)

Ported by meaning from Dojang's Companion repository (`jDelille/companion` @ 1cab554b),
not a licensed template: Member 360, kiosk, Do For Me rail, follow-up/inbox workflow
(`app/(companion)/hub/page.tsx` MessageCard). Hub contracts follow Jodi's
`dojo_companion_hub` (dojo-odoo19, 16 Oct 2026). Each file names its source in a comment.
