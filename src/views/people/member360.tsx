"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import { Ellipsis, Pencil, Sparkles } from "lucide-react";
import type { Member, MemberAttendance } from "@/domain/member";
import { membershipLabel } from "@/domain/member-presentation";
import { useDoForMe } from "@/views/doForMe/doForMeProvider";
import "./member360.css";
import MemberAvatar from "./memberAvatar";
import MemberOverview from "./memberOverview";
import { MemberRankHistory, MemberCourses, MemberBilling } from './memberRecords';
import MemberMessages from './memberMessages';
import MemberMessageDialog from './memberMessageDialog';
import MemberBookDialog from './memberBookDialog';
import MemberPaymentDialog from './memberPaymentDialog';
import MemberEditDialog from './memberEditDialog';
import HubUnavailable from '@/views/shell/hubUnavailable';
import MemberTools, { type MemberTool } from './memberTools';
import MemberWorkspace from './memberWorkspace';
import TestingEligibility from './testingEligibility';
import MemberTasks from './memberTasks';
import MemberOnboarding from './memberOnboarding';
import MemberSettlement from './memberSettlement';
import MemberTesting from './memberTesting';
import { useRouter } from 'next/navigation';
import MemberMoreDialog from './memberMoreDialog';
import { MemberAttendanceHistory, MemberBookings, MemberMembership, MemberTraining } from "./memberSections";

/*
   Member 360 (CRM screen C02), the centre column. Layout from Jodi's mockup
   (Desktop/inspiration/jodi-2.png, member360.png); behaviour from Companion
   1cab554b src/components/people/member-360 (Identity, Tabs). The People pane
   and the dark frame come from app/(main)/people/layout.tsx.

   "Do For Me" aims the shared staff rail at this member (views/doForMe). The
   action buttons open the existing governed Hub workflows.
*/

// The tab strip shows the mockup's ten sections. Training, Bookings, Notes and
// Student setup stay reachable from the "More" menu.
const TAB_NAMES = [
  "Overview",
  "Timeline",
  "Attendance",
  "Progress",
  "Membership",
  "Billing",
  "Messages",
  "Documents",
  "Family",
  "Safety",
  "Training",
  "Bookings",
  "Notes",
  "Student setup",
] as const;

type TabName = (typeof TAB_NAMES)[number];

const STRIP_TABS: readonly TabName[] = TAB_NAMES.slice(0, 10);

const tabId = (tab: TabName) => `member-tab-${tab.toLowerCase()}`;

// The header's outline buttons
const actionButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--crm-line) bg-(--crm-interactive) px-3.5 text-[13px] font-bold text-(--crm-text) transition-colors hover:border-(--crm-muted)";

type Props = {
  hubMode?: boolean;
  member: Member;
  attendance: MemberAttendance;
};

export default function Member360({ member, attendance, hubMode = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [authenticationLost, setAuthenticationLost] = useState(false);
  const [tool, setTool] = useState<MemberTool | null>(null), [moreOpen, setMoreOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false), [bookOpen, setBookOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false), [editOpen, setEditOpen] = useState(false);
  const router = useRouter();
  const clearRecord = useCallback(() => setAuthenticationLost(true), []);
  const doForMe = useDoForMe();
  if (authenticationLost) return <HubUnavailable code="SIGN_IN_REQUIRED" text="Sign in with your Odoo staff account." />;

  // "Children Advanced · Chen Family", or the member number when neither is recorded
  const subtitle =
    [member.training?.program, member.householdName].filter(Boolean).join(" · ") ||
    member.memberNumber ||
    "";

  // Arrow keys, Home and End move between tabs
  function moveBetweenTabs(event: KeyboardEvent<HTMLDivElement>) {
    const current = Math.max(STRIP_TABS.indexOf(activeTab), 0);
    let next: TabName | undefined;
    if (event.key === "ArrowRight") next = STRIP_TABS[(current + 1) % STRIP_TABS.length];
    if (event.key === "ArrowLeft") next = STRIP_TABS[(current - 1 + STRIP_TABS.length) % STRIP_TABS.length];
    if (event.key === "Home") next = STRIP_TABS[0];
    if (event.key === "End") next = STRIP_TABS[STRIP_TABS.length - 1];
    if (!next) return;

    event.preventDefault();
    setActiveTab(next);
    document.getElementById(tabId(next))?.focus();
  }

  // Overview links can open any section, including the menu-only ones
  function openTab(tab: string) {
    if ((TAB_NAMES as readonly string[]).includes(tab)) setActiveTab(tab as TabName);
  }

  return (
    <article className="member-profile min-w-0" data-member-id={member.id}>
      {tool && <MemberTools key={`${member.id}:${tool}`} memberId={member.id} tool={tool} onClose={() => { setTool(null); router.refresh(); }} onAuthenticationLost={clearRecord} />}
      {/* Identity: avatar, name, program · family, status pill */}
      <header className="member-profile-header">
        <div className="member-profile-identity">
          <MemberAvatar member={member} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold leading-tight text-(--crm-text)">
              {member.name}
            </h1>
            {subtitle && <p className="mt-1 text-[14px] text-(--crm-text-secondary)">{subtitle}</p>}
          </div>
          {/* Gold: the pill carries the rank (mastery) */}
          <span className="rounded-full border border-(--crm-mastery) px-3 py-1 font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.12em] text-(--crm-mastery)">
            {membershipLabel(member)} · {member.rank.name}
          </span>
        </div>

        {/* Actions, in the mockup's order. Use existing reviewed Hub actions. */}
        <div className="mt-3 flex flex-wrap gap-2 pb-4">
          <button
            type="button"
            disabled={!hubMode}
            title="Review a staff attendance record for a registered class"
            onClick={() => setTool('attendance')}
            className="inline-flex h-9 items-center rounded-lg bg-(--crm-brand) px-4 text-[13px] font-bold text-white"
          >
            Check in
          </button>
          <button type="button" disabled={!hubMode} title="Write to this student or their household" onClick={() => setMessagesOpen(true)} className={actionButton}>
            Message
          </button>
          <button type="button" disabled={!hubMode} title="Reserve a regular class through Odoo eligibility checks" onClick={() => setBookOpen(true)} className={actionButton}>
            Book
          </button>
          <button type="button" title="Billing summary for this student's household" onClick={() => setPaymentOpen(true)} className={actionButton}>
            Payment
          </button>
          <button type="button" disabled={!hubMode} onClick={() => setEditOpen(true)} className={actionButton}>
            <Pencil size={12} aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setMoreOpen(true)}
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

      {/* Message: write to the household (msg.png) */}
      {messagesOpen && (
        <MemberMessageDialog key={member.id} member={member} onClose={() => setMessagesOpen(false)} onAuthenticationLost={clearRecord} />
      )}

      {/* Book: pick an upcoming class, then review and confirm (book.png) */}
      {bookOpen && (
        <MemberBookDialog key={member.id} member={member} onClose={() => setBookOpen(false)} onAuthenticationLost={clearRecord} />
      )}

      {/* Payment: billing summary; "Pay" opens the invoice checkout step (payment.png) */}
      {paymentOpen && (
        <MemberPaymentDialog
          member={member}
          hubMode={hubMode}
          onClose={() => setPaymentOpen(false)}
          onPay={() => { setPaymentOpen(false); setTool('payment'); }}
        />
      )}

      {/* Edit: profile & training (edit-modal.png) */}
      {editOpen && (
        <MemberEditDialog
          key={member.id}
          member={member}
          onClose={() => setEditOpen(false)}
          onAskAI={() => { setEditOpen(false); doForMe.aim(`member:${member.id}`); }}
          onAuthenticationLost={clearRecord}
        />
      )}

      {/* •••: "Work with <name>" menu (dots-1.png, dot-2.png) */}
      {moreOpen && (
        <MemberMoreDialog
          member={member}
          hubMode={hubMode}
          onClose={() => setMoreOpen(false)}
          onTab={tab => { setMoreOpen(false); openTab(tab); }}
          onTool={key => { setMoreOpen(false); setTool(key); }}
          onEdit={() => { setMoreOpen(false); setEditOpen(true); }}
          onPayment={() => { setMoreOpen(false); setPaymentOpen(true); }}
          onMessage={() => { setMoreOpen(false); setMessagesOpen(true); }}
          onDoForMe={() => { setMoreOpen(false); doForMe.aim(`member:${member.id}`); }}
        />
      )}

      {/* Tab strip: scrolls sideways when it doesn't fit (member360.png) */}
      <div
        role="tablist"
        aria-label="Member sections"
        onKeyDown={moveBetweenTabs}
        className="member-profile-tabs flex gap-1 overflow-x-auto border-y border-(--crm-line)"
      >
        {STRIP_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              id={tabId(tab)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="member-tab-panel"
              tabIndex={isActive || (!STRIP_TABS.includes(activeTab) && tab === "Overview") ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-2.5 py-3 text-[13px] font-semibold transition-colors ${
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
        aria-labelledby={STRIP_TABS.includes(activeTab) ? tabId(activeTab) : undefined}
        aria-label={STRIP_TABS.includes(activeTab) ? undefined : activeTab}
        className="pt-5"
      >
        {activeTab === "Overview" ? (
          <MemberOverview member={member} attendance={attendance} onTab={openTab} />
        ) : activeTab === "Student setup" ? (
          hubMode ? <MemberOnboarding key={member.id} memberId={member.id} onAction={setTool} onTab={openTab} onAuthenticationLost={clearRecord} /> : <p className="rounded-xl border border-dashed border-(--crm-line) px-5 py-8 text-center text-sm text-(--crm-text-secondary)">Student setup needs the Odoo connection.</p>
        ) : activeTab === "Training" ? (
          <div className="space-y-4"><MemberTraining member={member} /><MemberCourses member={member} />{hubMode && <button type="button" className={actionButton} onClick={() => setTool('course')}>Manage course roster</button>}</div>
        ) : activeTab === "Bookings" ? (
          <div className="space-y-4"><MemberBookings member={member} />{hubMode && <div className="flex flex-wrap gap-2"><button type="button" className={actionButton} onClick={() => setBookOpen(true)}>Book class</button><button type="button" className={actionButton} onClick={() => setTool('change')}>Change booking</button></div>}</div>
        ) : activeTab === "Attendance" ? (
          <div className="space-y-4"><MemberAttendanceHistory attendance={attendance} />{hubMode && <div className="flex flex-wrap gap-2"><button type="button" className={actionButton} onClick={() => setTool('attendance')}>Record / correct staff attendance</button><button type="button" className={actionButton} onClick={() => setTool('checkout')}>Check out of class</button></div>}</div>
        ) : activeTab === 'Timeline' && hubMode ? (
          <div className="space-y-4"><MemberWorkspace key={`${member.id}:timeline`} memberId={member.id} section="timeline" onAction={setTool} onAuthenticationLost={clearRecord} /><MemberAttendanceHistory attendance={attendance} timeline /></div>
        ) : activeTab === "Membership" ? (
          <MemberMembership member={member} />
        ) : activeTab === 'Progress' ? (
          <div className="space-y-4"><MemberRankHistory member={member} />{hubMode && <><TestingEligibility memberId={member.id} name={member.name} onAuthenticationLost={clearRecord} /><MemberTesting key={member.id} memberId={member.id} name={member.name} onAuthenticationLost={clearRecord} /><button type="button" className={actionButton} onClick={() => setTool('rank')}>Review individual rank / stripe award</button></>}</div>
        ) : activeTab === 'Billing' ? (
          <div className="space-y-4"><MemberBilling member={member} />{hubMode && <><button type="button" className={actionButton} onClick={() => setTool('payment')}>Review invoice checkout</button><MemberSettlement key={member.id} memberId={member.id} name={member.name} onAuthenticationLost={clearRecord} /></>}</div>
        ) : activeTab === 'Messages' && hubMode ? (
          <MemberMessages key={member.id} memberId={member.id} onAuthenticationLost={clearRecord} />
        ) : hubMode && (activeTab === 'Family' || activeTab === 'Documents' || activeTab === 'Safety') ? (
          <MemberWorkspace key={`${member.id}:${activeTab}`} memberId={member.id} section={activeTab.toLowerCase() as 'family' | 'documents' | 'safety'} onAction={setTool} onAuthenticationLost={clearRecord} />
        ) : activeTab === 'Notes' && hubMode ? (
          <MemberTasks key={member.id} memberId={member.id} name={member.name} onAuthenticationLost={clearRecord} />
        ) : (
          <p className="rounded-xl border border-dashed border-(--crm-line) px-5 py-8 text-center text-sm text-(--crm-text-secondary)">
            {activeTab} isn&apos;t provided by this member read. {activeTab === "Safety" ? "Sensitive information requires explicit role and privacy rules before it can be displayed." : "No data is inferred from other records."}
          </p>
        )}
      </div>
    </article>
  );
}
