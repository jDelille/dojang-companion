"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  LEAD_ACTIONS,
  LIVE_VIEW_ACTIONS,
  looksLikeRequest,
  OPEN_COMMAND_EVENT,
  PERSON_ACTIONS,
  personCommands,
  type PaletteAction,
  type PaletteLead,
  type PalettePerson,
} from "@/domain/commands";
import type { Member } from "@/domain/member";
import { memberInitials, membershipLabel } from "@/domain/member-presentation";
import type { StaffConnection } from "@/domain/staff";
import {
  readPeopleForCommands,
  searchLeadsForCommands,
  type LeadsAnswer,
  type PeopleAnswer,
} from "@/integrations/commandSearch";
import { searchPages, type SearchEntry } from "@/routes/searchIndex";
import { useStaffConnection } from "./staffConnection";

/*
   The command bar ("Search, navigate, or ask AI…", ⌘K), laid out like the
   WhatsMax writeup's global command experience and Companion's command bar
   (Desktop/Screenshot 2026-10-28 122552.png), one column:

     PEOPLE     real members (People's Hub read); the first match gets the
                action chips (Open, Check In, Book, …, ✦ Ask AI)
     COMMANDS   questions about the first match
     LEADS      real open leads (Sales' Hub read with a query)
     PAGES      the Dojang pages
     LIVE VIEW  for a request rather than a name: an honest "not connected yet"
     ✦ Ask Do For Me: "…"

   Open is the only action that works. The other actions, the commands, live
   views and Ask Do For Me are disabled and marked "Not connected yet"
   (domain/commands.ts lists them), so nothing pretends to run. Keyboard:
   ⌘K/Ctrl+K focuses, ↑ ↓ move between people, leads and pages, Enter opens,
   Esc clears.

   Results are only kept for the staff member who searched: when who is signed
   in changes, the query and results go.
*/

const NOT_CONNECTED = "Not connected yet";
const PEOPLE_SHOWN = 5;
const LEADS_SHOWN = 5;
const PAGES_SHOWN = 5;
const LEAD_SEARCH_MIN = 2; // characters before asking Odoo for leads
const LEAD_SEARCH_MAX = 100; // the Hub's limit
const LEAD_SEARCH_DELAY_MS = 250; // wait for a pause in typing
const ASK_MIN = 2; // characters before offering Ask Do For Me

type Row =
  | { kind: "person"; person: PalettePerson }
  | { kind: "lead"; lead: PaletteLead }
  | { kind: "page"; page: SearchEntry };

// Each answer remembers which staff member it was read for
type PeopleState = { readFor: StaffConnection | null; answer: PeopleAnswer | null }; // answer null: loading
type LeadsState = { readFor: StaffConnection | null; query: string; answer: LeadsAnswer };

const groupLabel =
  "mx-4 mt-3 mb-1 block border-b border-(--crm-line) pb-2 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

// A palette person as a Member, for the shared label helpers
function asMember(person: PalettePerson): Member {
  return { id: person.id, name: person.name, membershipState: person.membershipState, rank: { name: person.rank } };
}

// "White Belt", or the membership when Odoo has no rank ("Unassigned")
function personDetail(person: PalettePerson) {
  return person.rank === "Unassigned" ? membershipLabel(asMember(person)) : person.rank;
}

// Names starting with the query (or with a word that does) first, then any containing it
function matchPeople(people: PalettePerson[], query: string) {
  const wanted = query.toLowerCase();
  const startsWith: PalettePerson[] = [];
  const contains: PalettePerson[] = [];
  for (const person of people) {
    const name = person.name.toLowerCase();
    if (name.split(/\s+/).some((word) => word.startsWith(wanted)) || name.startsWith(wanted)) {
      startsWith.push(person);
    } else if (name.includes(wanted)) {
      contains.push(person);
    }
  }
  return [...startsWith, ...contains];
}

function rowKey(row: Row) {
  if (row.kind === "person") return `person:${row.person.id}`;
  if (row.kind === "lead") return `lead:${row.lead.id}`;
  return `page:${row.page.path}`;
}

function rowHref(row: Row) {
  if (row.kind === "person") return `/people/${row.person.id}`;
  if (row.kind === "lead") return `/crm/leads/${row.lead.id}`;
  return row.page.path;
}

const optionId = (index: number) => `dojang-command-option-${index}`;

function Note({ children }: { children: ReactNode }) {
  return (
    <li role="presentation" className="px-4 py-2 text-[12px] text-(--crm-muted)">
      {children}
    </li>
  );
}

// The first match's actions as chips. Open works; the others are disabled.
function ActionChips({ actions, onOpen }: { actions: PaletteAction[]; onOpen: () => void }) {
  return (
    <li role="presentation" className="px-2 pb-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const label = action.ai ? `✦ ${action.label}` : action.label;
          if (action.connected && action.id === "open") {
            return (
              <button
                key={action.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onOpen}
                className="inline-flex h-9 items-center rounded-lg border border-(--crm-line) bg-(--crm-raised) px-3 text-[12px] font-bold text-(--crm-text) hover:border-(--crm-muted)"
              >
                {label}
              </button>
            );
          }
          return (
            <button
              key={action.id}
              type="button"
              disabled
              title={NOT_CONNECTED}
              aria-label={`${action.label} (${NOT_CONNECTED})`}
              className="inline-flex h-9 cursor-not-allowed items-center rounded-lg border border-(--crm-line) bg-(--crm-raised) px-3 text-[12px] font-bold text-(--crm-text-secondary) opacity-50"
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-(--crm-muted)">Only Open works here. The other actions are not connected yet.</p>
    </li>
  );
}

// A command or other line that can't run yet, marked as such
function UnavailableLine({ children, ai = false }: { children: ReactNode; ai?: boolean }) {
  return (
    <li
      role="presentation"
      title={NOT_CONNECTED}
      className={`flex cursor-not-allowed items-center gap-3 px-4 py-2.5 text-[13px] font-bold ${
        ai ? "text-(--crm-agent)/70" : "text-(--crm-text-secondary)"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className="shrink-0 text-[10px] font-normal text-(--crm-muted)">{NOT_CONNECTED}</span>
    </li>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const connection = useStaffConnection();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [people, setPeople] = useState<PeopleState | null>(null);
  const [leads, setLeads] = useState<LeadsState | null>(null);
  const [seenConnection, setSeenConnection] = useState(connection);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // A different staff member (or nobody): forget the search
  if (seenConnection !== connection) {
    setSeenConnection(connection);
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  }

  const signedOut = connection?.state === "signedOut";
  const trimmed = query.trim();
  const showPanel = open && trimmed.length > 0;

  // Ctrl/⌘K puts the cursor in the command bar
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    // A page's own search box (Front Desk) does the same
    const onOpenCommand = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpenCommand);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpenCommand);
    };
  }, []);

  // A click anywhere else closes the results
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Leads: asked from Odoo after a pause in typing
  const wantsLeads =
    showPanel && !signedOut && trimmed.length >= LEAD_SEARCH_MIN && trimmed.length <= LEAD_SEARCH_MAX;
  useEffect(() => {
    if (!wantsLeads) return;
    const readFor = connection;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchLeadsForCommands(trimmed).then(
        (answer) => {
          if (!cancelled) setLeads({ readFor, query: trimmed, answer });
        },
        () => {
          if (!cancelled) {
            setLeads({ readFor, query: trimmed, answer: { outcome: "unavailable", text: "Odoo isn't reachable right now." } });
          }
        },
      );
    }, LEAD_SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [wantsLeads, trimmed, connection]);

  // People: the member list, read once per staff member when the bar opens (and
  // again after a failed read)
  const peopleAnswer = people && people.readFor === connection ? people.answer : null;
  const peopleLoading = !!people && people.readFor === connection && people.answer === null;
  // retryFailed: read again after a failed read (on focus, not on every keystroke)
  function readPeopleIfNeeded(retryFailed: boolean) {
    if (signedOut || peopleLoading || peopleAnswer?.outcome === "loaded") return;
    if (peopleAnswer && !retryFailed) return;
    const readFor = connection;
    setPeople({ readFor, answer: null });
    readPeopleForCommands().then(
      (answer) => setPeople((current) => (current?.readFor === readFor ? { readFor, answer } : current)),
      () =>
        setPeople((current) =>
          current?.readFor === readFor
            ? { readFor, answer: { outcome: "unavailable", text: "Odoo isn't reachable right now." } }
            : current,
        ),
    );
  }

  // The rows the arrow keys move between, in the order they're shown
  const matchedPeople =
    peopleAnswer?.outcome === "loaded" ? matchPeople(peopleAnswer.people, trimmed).slice(0, PEOPLE_SHOWN) : [];
  const leadsAnswer =
    leads && leads.readFor === connection && leads.query === trimmed ? leads.answer : null; // null: still looking
  const matchedLeads = leadsAnswer?.outcome === "loaded" ? leadsAnswer.leads.slice(0, LEADS_SHOWN) : [];
  const pages = trimmed ? searchPages(trimmed, PAGES_SHOWN) : [];
  const rows: Row[] = [
    ...matchedPeople.map((person): Row => ({ kind: "person", person })),
    ...matchedLeads.map((lead): Row => ({ kind: "lead", lead })),
    ...pages.map((page): Row => ({ kind: "page", page })),
  ];
  const safeIndex = Math.min(activeIndex, rows.length - 1);
  const activeRow = safeIndex >= 0 ? rows[safeIndex] : null;

  // The first match gets the action chips (a person, or a lead when no person matches)
  const firstPerson = matchedPeople[0] ?? null;
  const firstLead = firstPerson ? null : (matchedLeads[0] ?? null);

  function close() {
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  }

  function openRow(row: Row) {
    router.push(rowHref(row));
    close();
    inputRef.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (rows.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((Math.max(safeIndex, 0) + step + rows.length) % rows.length);
    }
    if (event.key === "Enter" && activeRow) {
      event.preventDefault();
      openRow(activeRow);
    }
    if (event.key === "Escape") {
      close();
      inputRef.current?.blur();
    }
  }

  // Where each section's rows start in `rows`
  const leadsStart = matchedPeople.length;
  const pagesStart = leadsStart + matchedLeads.length;

  function option(row: Row, index: number, content: ReactNode) {
    const active = index === safeIndex;
    return (
      <li
        key={rowKey(row)}
        id={optionId(index)}
        role="option"
        aria-selected={active}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => openRow(row)}
        className={`mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 ${active ? "bg-(--crm-interactive)" : ""}`}
      >
        {content}
      </li>
    );
  }

  function personOption(person: PalettePerson, index: number) {
    return option({ kind: "person", person }, index, (
      <>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-canvas) font-(family-name:--crm-font-label) text-[10px] font-bold text-(--crm-text)"
        >
          {memberInitials(asMember(person))}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold text-(--crm-text)">{person.name}</span>
          <span className="block truncate text-[12px] text-(--crm-text-secondary)">{personDetail(person)}</span>
        </span>
      </>
    ));
  }

  function leadOption(lead: PaletteLead, index: number) {
    return option({ kind: "lead", lead }, index, (
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold text-(--crm-text)">{lead.name}</span>
        <span className="block truncate text-[12px] text-(--crm-text-secondary)">
          {[lead.contact, lead.stage].filter(Boolean).join(" · ") || "Lead"}
        </span>
      </span>
    ));
  }

  return (
    <div ref={wrapRef} className="relative min-w-0 flex-1">
      <Search
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--crm-muted)"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search, navigate, or ask AI"
        aria-expanded={showPanel}
        aria-controls="dojang-command-results"
        aria-autocomplete="list"
        aria-activedescendant={showPanel && activeRow ? optionId(safeIndex) : undefined}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
          readPeopleIfNeeded(false); // e.g. after signing in while the bar kept focus
        }}
        onFocus={() => {
          setOpen(true);
          readPeopleIfNeeded(true);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search, navigate, or ask AI…"
        className="h-10 w-full rounded-xl border border-(--crm-line) bg-(--crm-panel) pr-14 pl-9 text-[13px] font-semibold text-(--crm-text) placeholder:text-(--crm-text-secondary) focus:border-(--crm-muted) focus:outline-none"
      />
      <kbd
        title="Ctrl+K (⌘K on a Mac)"
        className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-(--crm-line) bg-(--crm-raised) px-1.5 py-0.5 font-(family-name:--crm-font-label) text-[10px] font-bold text-(--crm-text-secondary) sm:block"
      >
        ⌘K
      </kbd>

      {showPanel && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border border-(--crm-line) bg-(--crm-panel) pb-2 shadow-xl">
          <ul id="dojang-command-results" role="listbox" aria-label="Results">
            {/* PEOPLE: the first match, its actions, then the other matches */}
            <li role="presentation" className={groupLabel}>
              People
            </li>
            {signedOut ? (
              <Note>Sign in to search people.</Note>
            ) : !peopleAnswer ? (
              <Note>Looking up people…</Note>
            ) : peopleAnswer.outcome === "unavailable" ? (
              <Note>People couldn&apos;t be searched. {peopleAnswer.text}</Note>
            ) : matchedPeople.length === 0 ? (
              <Note>No people match.</Note>
            ) : (
              <>
                {personOption(matchedPeople[0], 0)}
                <ActionChips actions={PERSON_ACTIONS} onOpen={() => openRow({ kind: "person", person: matchedPeople[0] })} />
                {matchedPeople.slice(1).map((person, offset) => personOption(person, offset + 1))}
              </>
            )}

            {/* COMMANDS: questions about the first person (the agent isn't connected) */}
            {firstPerson && (
              <>
                <li role="presentation" className={groupLabel}>
                  Commands
                </li>
                {personCommands(firstPerson).map((command) => (
                  <UnavailableLine key={command.id}>{command.label}</UnavailableLine>
                ))}
              </>
            )}

            <li role="presentation" className={groupLabel}>
              Leads
            </li>
            {signedOut ? (
              <Note>Sign in to search leads.</Note>
            ) : trimmed.length < LEAD_SEARCH_MIN ? (
              <Note>Type at least {LEAD_SEARCH_MIN} characters to search leads.</Note>
            ) : trimmed.length > LEAD_SEARCH_MAX ? (
              <Note>Too long to search leads.</Note>
            ) : !leadsAnswer ? (
              <Note>Looking up leads…</Note>
            ) : leadsAnswer.outcome === "unavailable" ? (
              <Note>Leads couldn&apos;t be searched. {leadsAnswer.text}</Note>
            ) : matchedLeads.length === 0 ? (
              <Note>No open leads match.</Note>
            ) : (
              <>
                {leadOption(matchedLeads[0], leadsStart)}
                {firstLead && (
                  <ActionChips actions={LEAD_ACTIONS} onOpen={() => openRow({ kind: "lead", lead: firstLead })} />
                )}
                {matchedLeads.slice(1).map((lead, offset) => leadOption(lead, leadsStart + offset + 1))}
              </>
            )}

            {pages.length > 0 && (
              <>
                <li role="presentation" className={groupLabel}>
                  Pages
                </li>
                {pages.map((page, offset) =>
                  option({ kind: "page", page }, pagesStart + offset, (
                    <span className="min-w-0 truncate text-[13px] font-bold text-(--crm-text)">
                      {page.label}
                      <span className="ml-2 text-[11px] font-normal text-(--crm-muted)">{page.sub}</span>
                    </span>
                  )),
                )}
              </>
            )}

            {/* A request rather than a name: the writeup's LIVE VIEW, without
                results, because nothing can build one yet */}
            {looksLikeRequest(trimmed) && (
              <>
                <li role="presentation" className={groupLabel}>
                  Live view
                </li>
                <Note>
                  Live views from a request like this aren&apos;t available yet. They need Ask AI and an Odoo read
                  that DreamOS doesn&apos;t have, so no results are shown.
                </Note>
                {LIVE_VIEW_ACTIONS.map((action) => (
                  <UnavailableLine key={action.id}>{action.label}</UnavailableLine>
                ))}
              </>
            )}

            {trimmed.length >= ASK_MIN && (
              <UnavailableLine ai>✦ Ask Do For Me: “{trimmed}”</UnavailableLine>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
