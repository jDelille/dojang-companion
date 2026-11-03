# Roster source integration experiment

## Current adoption: Sales pipeline

The migrated Roster board now replaces the previous board at **`/crm`**. Sales
is the single navigation entry. `/roster` redirects to `/crm`, preserving a
lead/contact-name `q` query. The original Roster reference snapshot is unchanged.

| Existing Sales capability | Result after replacement |
| --- | --- |
| Odoo lead/contact-name search and clear search | Same server `getCrmContext(query)` read and `/crm?q=...` form |
| Owner, stage, source and tag filters; reset | Same `organizeLeads` logic, applied before the Roster adapter |
| Overdue, due today and needs-follow-up filters | Same recorded-evidence rules; unsupported evidence stays unknown |
| Source-order, name and recorded-priority sorting | Same domain sorter; order flows into Roster stage cards |
| Board/list switch | Migrated Roster board and existing full lead list share selection |
| Lead tray and workspace links | Same LeadTray; cards/click/keyboard/Preview select the authoritative lead ID |
| Companion context | Same Sales/selected-lead context; cleared by existing focus/auth lifecycle |
| Follow-up queue and governed actions | Same routes and lead workspace; no duplicated write implementation |
| Fixture-only Lost list | Preserved outside the board; real archived leads remain unavailable |
| Fixtures, caps, errors, authentication | Existing banners and shared failures; counts explicitly scoped to loaded data |

Cards now include tags, source, owner, recorded priority/reason, next step, open
tasks, overdue and due-today counts. Selected cards are highlighted. The Sales
host controls selection, so the standalone preview modal does not compete with
the existing tray or retain an old selected-record object. If filters or a new
read exclude a selection, the tray and Companion use the current visible result.
The original generic modal remains available in the source-derived component's
standalone mode, but `/crm` uses its controlled mode.

No Hub contracts, authentication, write permissions, lead detail, notes/task
completion or AI implementation changed in this replacement. Unsupported stage
mutation and vendor create/edit/delete remain disabled.

## Git protection and scope

On 2026-11-02 the initial working tree was clean on `main`, including untracked
files checked with `git status --porcelain=v1 --untracked-files=all`. The CRM,
notes/task completion and Companion work was already committed in
`9f47661` (`wip: working on crm functionality`).

Created `roster-integration` at that commit using `git switch -c`. No reset,
stash, deletion, commit or push was performed. `main` remains at its original
commit. This experiment's changes are uncommitted in the current working tree;
they are not a separately committed snapshot. Preserve them before switching
branches. Existing CRM, People, Member 360, Front Desk, Hub and Companion source
was not replaced. Existing runtime changes are shell route classification,
navigation and the Sales host's board import/data adapter; the host retains its
search, filters, list, tray and Companion orchestration.

## Actual source and compatibility

Original application: `C:\Users\justi\Desktop\Companion_Biz_Violoop\roster`.
This is the real application, not `ROSTER-R1.md` or the documentation directory.
Package identity: `roster`, version `1.0.0`.

| Area inspected | Original Roster implementation | DreamOS decision |
| --- | --- | --- |
| Framework | Next.js `^15.1.3`, App Router, React/React DOM `^19.0.0`, TypeScript `^5.7.2`, Node >=20 | React components work in Next 16.2.11 / React 19.2.7; retain DreamOS build and routing |
| Package/build | npm `package-lock.json`; `next dev`; build runs `prisma generate && next build`; vendor `next lint` script | Keep current npm lockfile, scripts and ESLint 9; no Prisma generation |
| Directory structure | `app`, `components`, `lib`, `styles`, `public`, `messages`, `prisma`, `workers`, `deploy`, `scripts` | Source references remain inert; only the selected frontend slice compiles |
| Routes/layouts | `(dashboard)/dashboard/*`, `(auth)`, public booking/payment/review routes and many `app/api/*` handlers; custom DashboardShell | Sales `/crm` uses the migrated board under `(main)`; `/roster` is an alias redirect; keep DreamOS nav/session/shell |
| Components | Pipeline, contacts, tasks, inbox, leads, appointments, retention, agents, settings, charts, reusable UI kit | Import real components as references; activate PipelineBoard and seven UI modules first |
| State | React useState/useEffect/useCallback, local component state, API fetches; theme context/localStorage; NextAuth provider | Keep only selected lead ID locally; derive displayed data from current authoritative server props |
| Styling/assets | Tailwind 3.4, Ledger CSS tokens, global resets, custom radii/colors/fonts, light/dark provider; PNG icons, widget and service worker JS | Tailwind 4 equivalents in adapted source; scoped token bridge; preserve PNGs as references; do not register vendor JS or global styles |
| API layer | REST `/api/pipeline/deals`, `/api/contacts`, `/api/tasks`, etc.; Zod plus `withWorkspace`/NextAuth RBAC wrappers | No vendor API routes mounted; existing authenticated `getCrmContext` / Hub boundary supplies data |
| Auth | NextAuth credentials/bcrypt, JWT session, Prisma users/workspaces, vendor RBAC and installer/license/dashboard gates | Do not mount a second app/auth system; use DreamOS sealed Odoo staff session and Hub authorization |
| Persistence | Prisma 6.1/PostgreSQL, tenant/workspace schemas, contacts/deals/tasks/conversations | No Prisma dependency, migrations or parallel database introduced |
| Jobs/integrations | BullMQ/ioredis, separate workers for lead gathering, retention, reminders, outbound, crypto and license checks; provider SDKs | Inactive; no jobs, queues, provider sends or new backend capabilities enabled |
| Deployment | Postgres 16/Redis 7 compose infrastructure; separate web and worker systemd services; vendor i18n plugin and serverExternalPackages | Existing DreamOS deployment/apphosting settings unchanged; no worker process or services added |

The frontend is compatible after import/theme/data adaptations. Running the
whole Roster application unchanged would introduce incompatible authority,
authentication and persistence assumptions, so this experiment migrates real
source incrementally inside DreamOS.

## Source imported and provenance

`vendor/licensed/roster/source/` preserves **101 files, 761,468 bytes**, byte for
byte. Its `SOURCE-MANIFEST.json` records the original absolute source root,
relative file paths, byte lengths and SHA-256 values. Tests verify every hash.

Included:

- Entire `components/` tree, including actual pipeline, tasks, agents, contacts,
  inbox, retention, charts and UI implementations.
- Dashboard page/layout source from `app/(dashboard)/` for later migration.
- `styles/`, `messages/`, `app/globals.css` and public PNG icons.
- `lib/utils.ts`, `lib/retention-shared.ts`, `package.json`, `README.md` and
  Next/Tailwind/PostCSS/TypeScript configuration as reference metadata.

Excluded: `node_modules`, build output, caches, all environment files (including
the example), `.git`, lockfiles, deployment/service files, service workers,
widgets, API handlers and backend implementation directories. Earlier narrowly
extracted reference files already under `vendor/licensed/roster/` are untouched.

Reproduce the selected snapshot with:

```powershell
python tools/import-roster-source.py 'C:\Users\justi\Desktop\Companion_Biz_Violoop\roster'
```

The importer refuses to overwrite a different existing reference file. Original
sources are excluded from TypeScript and ESLint by existing `vendor/` rules and
are never runtime imports. They do not register routes merely by being present.

## Active files and changes from Roster

| Active DreamOS source | Original source | Changes |
| --- | --- | --- |
| `src/templates/roster/components/pipeline/kanban.tsx` | `components/pipeline/kanban.tsx` | Migrated original column/card render body, stage selector and header. Replace local REST loading with typed Hub props. Add controlled selection for Sales tray/Companion, selected styling, tags and recorded evidence. Standalone preview uses original Modal; Sales uses its shared tray. Remove optimistic moves, DnD and vendor mutations. |
| `components/ui/button.tsx`, `button-styles.ts`, `card.tsx`, `data.tsx`, `form.tsx`, `layout.tsx`, `overlay.tsx` under that same template root | Same paths under Roster's `components/ui/` | Relocate internal imports; map Tailwind 3 named radii/fonts/colors to existing/Tailwind 4 arbitrary utilities; remove unused import baggage; fix `aria-labeledby` to `aria-labelledby`; preserve pre-existing body scroll styles on modal cleanup. |
| `src/templates/roster/lib/utils.ts` | Replacement seam for `lib/utils.ts` | Local class-string joining only. No clsx object API or tailwind-merge conflict resolution; this slice avoids conflicting class overrides. Not a wholesale utility-library replacement. |
| `src/templates/roster/adapters/pipeline.ts` | DreamOS-native adapter | Project authoritative CRM leads/stages into the migrated board. Preserve identity/order, qualify capped counts and keep unstaged/missing-stage leads visible in explicit display groups. No value/currency/date/contact-ID fabrication. |
| `src/templates/roster/roster.css` | Bridge for Ledger token names | Scoped to `.roster-scope`, mapped to DreamOS colors. Vendor global resets, fonts, `:root` and theme/localStorage provider are not loaded. |
| `src/views/crm/salesPipeline.tsx`, existing `/crm` page | DreamOS-native host | Existing authenticated CRM integration, search, filters, sorting, list, Lost handling, tray, Companion and failure states. Replace previous LeadBoard with migrated PipelineBoard. |
| `src/app/(main)/roster/page.tsx` | DreamOS-native alias | Redirect legacy experiment bookmarks to Sales, preserving search. |

Exact original hashes are in the manifest; the license map links this experiment
to it. This is migrated source, not an iframe, screenshot recreation, or a
second running template application.

## Working functionality and backend boundaries

Available at `/crm` and the **Sales** navigation item:

- Original horizontally scrolling pipeline column/card presentation.
- Leads grouped by Odoo stage, plus explicit display-only groups when needed.
- Original form/button/card/empty-state primitives and stage selector, read-only.
- Click, keyboard Enter/Space, double-click or visible Preview lead control
  selects the lead in the shared tray and Companion context. Manual browser
  verification remains needed.
- Existing lead workspace link supports the approved note, task completion and
  reviewed follow-up workflows. This experiment does not duplicate them.
- Refresh uses current no-store Hub reads. Failed reads show shared sign-in or
  error handling, never a fallback board with sample data.

Connected data path:

```text
/crm server page
  -> getCrmContext()
  -> readHubAsStaff("crm_context", { query: "" })
  -> configured site + sealed staff session
  -> Jodi Hub/Odoo
  -> Sales filters/sort -> typed display adapter -> migrated PipelineBoard
  -> shared lead selection / LeadTray / Companion
```

No Roster APIs or template mocks run. If DreamOS is explicitly in its existing
fixture mode, this route uses that same fixture read with a visible development
label. Real Hub errors never substitute fixtures.

Disconnected: original deal creation/edit/delete, drag/drop/keyboard stage
mutation, contact creation, exact monetary totals/currency/creation timestamps,
vendor agent configuration, chat/voice, retention campaigns, invoices, provider
sends and background workers. Unmigrated screens are reference files, not
reachable DreamOS screens. English labels are fixed for this first slice;
Roster's translated message files are preserved but next-intl is not installed.
The Sales host sets the same selected-lead Companion focus as before; this does
not enable lead-aware AI, which remains unsupported. Open the lead workspace for
its recorded context and governed follow-up review.

Existing replacements for later slices:

- `crm_context`/`lead_details`: pipeline, lead evidence, internal notes/history.
- `context`/`member_details`: People/contact presentation where identity and
  supported fields match; do not equate vendor contacts with Odoo members.
- Existing `complete_task`, `add_lead_note`, reviewed `prepare_lead_action`:
  governed internal CRM actions with permissions, versions and request keys.
- Existing Inbox Hub reads and Jodi-backed Companion endpoint: communication and
  supported AI surfaces, subject to their current scopes. No provider SDKs.
- Calendar/voice/retention/provider sends and Roster deal-money fields still need
  explicitly approved contracts; do not infer them from route names.

## Dependency/environment decisions

**No dependencies added or changed.** React, Next.js, TypeScript, lucide-react and
Tailwind are already present. `package.json`, `package-lock.json`, apphosting and
environment files are unchanged. The root import aliases remain unchanged.

Replace next-intl usage in this active board with fixed English text. Replace
clsx/tailwind-merge at a small explicit class-string seam. Convert Tailwind 3
theme utilities locally instead of loading another global Tailwind theme.
Vendor NextAuth, Prisma, Zod, BullMQ, Redis, bcrypt, date-fns, provider SDKs,
calendar/crypto/billing libraries and installer/license runtime are unnecessary
for this slice and are not installed.

Inspected environment **names only** from the original example; no values/files
were copied: `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_*`, `ENCRYPTION_KEY`,
`ROSTER_TENANCY_MODE`, public app/widget settings, model-provider keys, Twilio,
Google Maps/calendar, Microsoft calendar, Stripe/Paystack, SMTP/mail API, VAPID
and license configuration. None is required by this integration; existing
DreamOS/Jodi environment settings remain the boundary.

## Verification and next slice

Verification commands: `npm run typecheck`; changed-file ESLint;
`npm run build`; `bash tools/test-roster.sh`, `tools/test-crm-domain.sh`,
`tools/test-companion.sh`, `tools/test-hub-gateway.sh`.

The current Sales replacement passes **78 tests**: Roster/parity 15, CRM 25,
Companion 19 and gateway 19. Typecheck, changed-file ESLint and production build
passed, including `/crm`, `/crm/leads/[id]`, `/crm/follow-ups`, `/roster` and
`/api/companion/ask`. `git diff --check` passed. Adoption adds route/parity,
search, controlled-selection, filtering, list/Lost and fixture tests to the
Roster suite. No commits, pushes, browser automation, live provider calls or
live Odoo writes. Manual browser verification remains outstanding.

The Roster suite covers actual component/server-route markup, authenticated-read
failure propagation without a sample board, exact lead identity, orphan/unstaged
groups, capped counts, disabled writes, accessible modal title, reference hashes
and the absence of vendor API/auth/database imports in active source. These are
Node/SSR tests, not browser automation or live Odoo writes.

Recommended next slice: migrate actual `components/tasks/tasks-client.tsx` onto
the existing scoped follow-up read and governed task-completion editor. Preserve
Roster's operator grouping/layout, but use Hub states/versions/permissions and
the existing completion receipt workflow instead of optimistic REST toggles,
invented timestamps, reopen/create/delete or another task database.
