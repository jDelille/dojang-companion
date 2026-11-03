"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Member } from "@/domain/member";
import { memberSummary } from "@/domain/member-presentation";
import MemberAvatar from "./memberAvatar";
import StudentIntakeLauncher from './studentIntakeLauncher';

/*
   The People pane, left of Member 360 (Jodi's mockup, Desktop/inspiration/jodi-2.png):
   search, saved views, the member list and the selected member. Behaviour from
   Companion 1cab554b src/components/shell/ContextPane.tsx (People section).

   The People layout puts it in the shell's context pane, so it stays put (and
   keeps the search) while staff move between members. The selected member comes from the URL.
*/

const NOT_CONNECTED = "Not connected yet";

const sectionLabel =
  "mb-2 block font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

const row =
  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors";
const activeRow = "border-(--crm-line) bg-(--crm-interactive) text-(--crm-text)";
const idleRow =
  "border-transparent text-(--crm-text-secondary) hover:bg-(--crm-raised) hover:text-(--crm-text)";

// Name or member number, like Companion's searchMembers()
function matchesSearch(member: Member, search: string) {
  return (
    member.name.toLowerCase().includes(search) ||
    (member.memberNumber ?? "").toLowerCase().includes(search)
  );
}

export default function PeoplePane({ members, allowIntake = false }: { members: Member[]; allowIntake?: boolean }) {
  const params = useParams<{ id?: string }>();
  const selectedId = params.id;
  const selected = members.find((member) => member.id === selectedId);

  const [query, setQuery] = useState("");
  const [state, setState] = useState('all');
  const search = query.trim().toLowerCase();
  const shown = members.filter(member => (!search || matchesSearch(member, search)) && (state === 'all' || member.membershipState === state));

  return (
    <aside
      aria-label="People"
      className="flex min-w-0 flex-col gap-5 p-4"
    >
      <h2 className="px-1 text-lg font-bold text-(--crm-text)">Members</h2>
      {allowIntake && <StudentIntakeLauncher />}

      <label className="relative block">
        <span className="sr-only">Search members</span>
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--crm-muted)"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members..."
          className="h-10 w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) pr-3 pl-9 text-[13px] text-(--crm-text) placeholder:text-(--crm-muted) focus:border-(--crm-muted) focus:outline-none"
        />
      </label>
      <label className="block text-[12px] text-(--crm-muted)">Recorded student state
        <select value={state} onChange={e => setState(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-(--crm-line) bg-(--crm-canvas) px-3 text-[13px] text-(--crm-text)">
          <option value="all">All states</option><option value="lead">Prospective · Lead</option><option value="trial">Trial</option><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option>
        </select>
      </label>

      {/* Only "All members" has a source. The other two are in the mockup but
          nobody has defined who counts yet, so they show no number. */}
      <section aria-label="Saved views">
        <span className={sectionLabel}>Saved views</span>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => { setQuery(''); setState('all'); }}
              className={`${row} ${activeRow} justify-between`}
            >
              All members
              <span className="text-[11px] text-(--crm-muted)">{members.length}</span>
            </button>
          </li>
          {["Testing eligible", "At risk"].map((view) => (
            <li key={view}>
              <button
                type="button"
                disabled
                title={NOT_CONNECTED}
                className={`${row} border-transparent justify-between text-(--crm-muted)`}
              >
                {view}
                <span className="text-[11px]">—</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={search ? "Search results" : "Member list"}>
        <span className={sectionLabel}>{search || state !== 'all' ? 'Results' : 'Members'}</span>
        <p className="mb-2 text-[11px] text-(--crm-muted)">{shown.length} of {members.length} loaded records</p>
        {shown.length === 0 ? (
          <p className="px-1 text-[13px] text-(--crm-muted)">No members match.</p>
        ) : (
          <ul className="flex max-h-88 flex-col gap-1 overflow-y-auto">
            {shown.map((member) => {
              const isSelected = member.id === selectedId;
              return (
                <li key={member.id}>
                  <Link
                    href={`/people/${member.id}`}
                    aria-current={isSelected ? "page" : undefined}
                    className={`${row} ${isSelected ? activeRow : idleRow}`}
                  >
                    <MemberAvatar member={member} size="small" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{member.name}</span>
                      <span className="block truncate text-[11px] text-(--crm-muted)">
                        {memberSummary(member)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* The member on screen, as in the mockup's "Selected" card */}
      {selected && (
        <section aria-label="Selected member">
          <span className={sectionLabel}>Selected</span>
          <Link
            href={`/people/${selected.id}`}
            className="flex items-center gap-3 rounded-xl border border-(--crm-text-secondary) bg-(--crm-raised) px-3 py-3"
          >
            <MemberAvatar member={selected} size="small" />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-(--crm-text)">
                {selected.name}
              </span>
              <span className="block truncate text-[11px] text-(--crm-muted)">
                {memberSummary(selected)}
              </span>
            </span>
          </Link>
        </section>
      )}
    </aside>
  );
}
