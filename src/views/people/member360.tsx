"use client";

import { useState, type KeyboardEvent } from "react";
import { Ellipsis, Pencil, Sparkles } from "lucide-react";
import type { Member, MemberAttendance } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { useDoForMe } from "@/views/doForMe/doForMeProvider";
import MemberAvatar from "./memberAvatar";
import MemberOverview from "./memberOverview";
import { MemberAttendanceHistory, MemberBookings, MemberContact, MemberMembership, MemberTraining } from "./memberSections";

/*
   Member 360 (CRM screen C02), the centre column. Layout from Jodi's mockup
   (Desktop/inspiration/jodi-2.png, member360.png); behaviour from Companion
   1cab554b src/components/people/member-360 (Identity, Tabs). The People pane
   and the dark frame come from app/(main)/people/layout.tsx.

   "Do For Me" aims the shared staff rail at this member (views/doForMe). The
   other action buttons are disabled until they're connected (read-only).
*/

const TAB_NAMES = [
  "Overview",
  "Training",
  "Bookings",
  "Timeline",
  "Attendance",
  "Progress",
  "Membership",
  "Billing",
  "Messages",
  "Documents",
  "Family",
  "Notes",
  "Safety",
] as const;

type TabName = (typeof TAB_NAMES)[number];

const tabId = (tab: TabName) => `member-tab-${tab.toLowerCase()}`;

const NOT_CONNECTED = "Not connected yet";

// The header's outline buttons
const actionButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3 text-[12px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted)";

type Props = {
  member: Member;
  attendance: MemberAttendance;
};

export default function Member360({ member, attendance }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const doForMe = useDoForMe();

  // "Children Advanced · Chen Family", or the member number when neither is recorded
  const subtitle =
    [member.training?.program, member.householdName].filter(Boolean).join(" · ") ||
    member.memberNumber ||
    "";

  // Arrow keys, Home and End move between tabs
  function moveBetweenTabs(event: KeyboardEvent<HTMLDivElement>) {
    const current = TAB_NAMES.indexOf(activeTab);
    let next: TabName | undefined;
    if (event.key === "ArrowRight") next = TAB_NAMES[(current + 1) % TAB_NAMES.length];
    if (event.key === "ArrowLeft") next = TAB_NAMES[(current - 1 + TAB_NAMES.length) % TAB_NAMES.length];
    if (event.key === "Home") next = TAB_NAMES[0];
    if (event.key === "End") next = TAB_NAMES[TAB_NAMES.length - 1];
    if (!next) return;

    event.preventDefault();
    setActiveTab(next);
    document.getElementById(tabId(next))?.focus();
  }

  return (
    <article className="min-w-0" data-member-id={member.id}>
      {/* Identity: avatar, name, program · family, status pill */}
      <header>
        <div className="flex flex-wrap items-start gap-4">
          <MemberAvatar member={member} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight text-(--crm-text)">
              {member.name}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-(--crm-text-secondary)">{subtitle}</p>}
          </div>
          {/* Gold: the pill carries the rank (mastery) */}
          <span className="rounded-full border border-(--crm-mastery) px-3 py-1 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.12em] text-(--crm-mastery)">
            {membershipLabel(member)} · {member.rank.name}
          </span>
        </div>

        {/* Actions, in the mockup's order. None are connected yet. */}
        <div className="mt-4 flex flex-wrap gap-2 pb-4">
          <button
            type="button"
            disabled
            title={NOT_CONNECTED}
            className="inline-flex h-8 items-center rounded-lg bg-(--crm-brand) px-4 text-[12px] font-bold text-white"
          >
            Check in
          </button>
          <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
            Message
          </button>
          <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
            Book
          </button>
          <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
            Payment
          </button>
          <button type="button" disabled title={NOT_CONNECTED} className={actionButton}>
            <Pencil size={12} aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            disabled
            title={NOT_CONNECTED}
            aria-label="More actions"
            className={actionButton}
          >
            <Ellipsis size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => doForMe.aim(`member:${member.id}`)}
            className={actionButton}
          >
            <Sparkles size={12} aria-hidden="true" />
            Do For Me
          </button>
        </div>
      </header>

      {/* Tab strip: scrolls sideways when it doesn't fit (member360.png) */}
      <div
        role="tablist"
        aria-label="Member sections"
        onKeyDown={moveBetweenTabs}
        className="flex gap-1 overflow-x-auto border-y border-(--crm-line)"
      >
        {TAB_NAMES.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={tabId(tab)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="member-tab-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-2.5 py-3 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "border-(--crm-brand) text-(--crm-text)"
                  : "border-transparent text-(--crm-text-secondary) hover:text-(--crm-text)"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div
        id="member-tab-panel"
        role="tabpanel"
        aria-labelledby={tabId(activeTab)}
        className="pt-5 sm:pt-6"
      >
        {activeTab === "Overview" ? (
          <><MemberContact member={member} /><MemberOverview member={member} attendance={attendance} /></>
        ) : activeTab === "Training" ? (
          <MemberTraining member={member} />
        ) : activeTab === "Bookings" ? (
          <MemberBookings member={member} />
        ) : activeTab === "Attendance" || activeTab === "Timeline" ? (
          <MemberAttendanceHistory attendance={attendance} timeline={activeTab === "Timeline"} />
        ) : activeTab === "Membership" ? (
          <MemberMembership member={member} />
        ) : (
          <p className="rounded-xl border border-dashed border-(--crm-line) px-5 py-8 text-center text-sm text-(--crm-text-secondary)">
            {activeTab} isn&apos;t provided by this member read. {activeTab === "Safety" ? "Sensitive information requires explicit role and privacy rules before it can be displayed." : "No data is inferred from other records."}
          </p>
        )}
      </div>
    </article>
  );
}
