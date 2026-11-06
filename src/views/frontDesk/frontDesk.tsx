"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffSessionReset } from '@/views/shell/staffSession';
import { useMarkSignedOut } from '@/views/shell/staffConnection';
import { Search } from "lucide-react";
import { OPEN_COMMAND_EVENT } from "@/domain/commands";
import {
  getInboxContext,
  getSessionRoster,
  SIGN_IN_CODES,
  type InboxContextAnswer,
  type SessionRosterAnswer,
} from "@/integrations/hub";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { ErrorBlock, LoadingBlock } from "@/views/inbox/inboxStates";
import { ContextPane } from "@/views/shell/contextPane";
import { HubSignOutButton } from "@/views/shell/hubUnavailable";
import { useWorkspaceTabs } from "@/views/shell/openTabs";
import StaffSignIn from "@/views/shell/staffSignIn";
import ActiveContext, { type ActiveContextItem } from "./activeContext";
import ArrivingSoon, { type TodaySession } from "./arrivingSoon";
import { deskRailContext, type CrmRead } from "./frontDeskRail";
import ServiceQueue from "./serviceQueue";
import CrmAttention from "./crmAttention";
import Link from "next/link";

/*
   Front Desk, laid out like Desktop/do-for-me-1.png and the "Front Desk Mode"
   section (the WhatsMax writeup's arrivals + communications + CRM + quick
   actions + Companion):

     [context pane: Arriving soon] [FRONT DESK · CURRENT WORK
                                    search box (opens the command bar)
                                    Active context | Service queue] [Do For Me: tasks due]

   A composition of existing reads, never a new source of truth:
   - the Hub's context read (the Inbox's getInboxContext): today's classes and
     the WhatsMax guardian messages (the service queue)
   - the Hub's session_roster per class (getSessionRoster): booked and arrived
   - member_details for the active member (the Inbox panel's read)
   - crm_context, read on the server by the page: the rail's tasks due
   Existing reviewed member actions reuse the Member 360 tools. The active member is the one tapped here, otherwise the newest
   member tab (like Companion's front desk).
*/

// Rosters are read for this many of today's classes at most
const ROSTER_LIMIT = 12;

// Starts today in the viewer's own time zone (staff are at the school)
function isToday(iso: string | null) {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

const MEMBER_TAB = /^\/people\/([^/]+)$/;

export default function FrontDesk({ crm, source }: { crm: CrmRead; source: "hub" | "fixture" }) {
  const router = useRouter();
  const resetSession=useStaffSessionReset(),markSignedOut=useMarkSignedOut();
  const requestSequence=useRef(0);
  const [suppressedCrm,setSuppressedCrm]=useState<CrmRead|null>(null);
  const safeCrm:CrmRead=suppressedCrm!==crm?crm:{outcome:"unavailable",text:"Refresh CRM context for the current staff session."};
  const tabs = useWorkspaceTabs();
  const [answer, setAnswer] = useState<InboxContextAnswer | null>(null); // null while loading
  const [rosters, setRosters] = useState<Record<string, SessionRosterAnswer | undefined>>({});
  const [reads, setReads] = useState(0); // counts reloads, so rosters are read again
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chosen, setChosen] = useState<ActiveContextItem | undefined>(undefined); // undefined: nothing tapped yet

  // The first read, when the page opens
  useEffect(() => {
    let cancelled = false;
    const sequence=++requestSequence.current;
    getInboxContext().then((next) => {
      if (!cancelled&&sequence===requestSequence.current) setAnswer(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read everything again (Refresh, after sign-in or sign-out)
  const reload = useCallback(async () => {
    const sequence=++requestSequence.current;
    setSuppressedCrm(crm);
    setAnswer(null);
    setRosters({});
    setChosen(undefined);
    setReads((count) => count + 1);
    const next=await getInboxContext();
    if(sequence===requestSequence.current)setAnswer(next);
    router.refresh();
  }, [router,crm]);

  const authenticationLost=useCallback(()=>{++requestSequence.current;resetSession();markSignedOut();setSuppressedCrm(crm);setChosen(undefined);setSessionId(null);setRosters({});setAnswer({outcome:"unavailable",code:"SIGN_IN_REQUIRED",text:"Sign in again to view Front Desk."});},[resetSession,markSignedOut,crm]);

  const context = answer?.outcome === "loaded" ? answer.context : null;
  const needsSignIn = answer?.outcome === "unavailable" && SIGN_IN_CODES.includes(answer.code ?? "");
  const todaySessions: TodaySession[] = context ? context.sessions.filter((session) => isToday(session.startsAt)) : [];
  const rosterIds = todaySessions
    .slice(0, ROSTER_LIMIT)
    .map((session) => session.id)
    .join(",");

  // Each of today's classes' roster, read side by side
  useEffect(() => {
    if (!rosterIds) return;
    let cancelled = false;
    for (const id of rosterIds.split(",")) {
      getSessionRoster(id).then((next) => {
        if (!cancelled) {
          if(next.outcome === "unavailable" && SIGN_IN_CODES.includes(next.code ?? "")){authenticationLost();return;}
          setRosters((current) => ({ ...current, [id]: next }));
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [rosterIds, reads,authenticationLost]);

  // The active context: what was tapped here, otherwise the newest member tab
  const newestMemberTab = [...tabs].reverse().find((tab) => MEMBER_TAB.test(tab.href));
  const tabMemberId = newestMemberTab ? (MEMBER_TAB.exec(newestMemberTab.href)?.[1] ?? null) : null;
  const active: ActiveContextItem =
    chosen !== undefined ? chosen : tabMemberId ? { kind: "member", memberId: tabMemberId } : null;
  const activeMemberId = active?.kind === "member" ? active.memberId : null;
  const activeMessageId = active?.kind === "message" ? active.message.id : active?.message?.id ?? null;

  function refresh() {
    void reload();
  }

  return (
    <div className="crm-scope">
      {context && !activeMemberId && <DoForMeFocus focusKey="front-desk" context={deskRailContext(safeCrm)} />}

      {context && (
        <ContextPane>
          <ArrivingSoon
            sessions={todaySessions}
            rosters={rosters}
            rosterLimit={ROSTER_LIMIT}
            selectedSessionId={sessionId}
            onSelectSession={setSessionId}
            activeMemberId={activeMemberId}
            onSelectMember={(memberId) => setChosen({ kind: "member", memberId })}
          />
        </ContextPane>
      )}

      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)">
          Front desk · Current work
        </h1>
        <div className="flex items-center gap-4 text-[12px] text-(--crm-text-secondary)">
          <span>Tap a member for details</span>
          <button
            type="button"
            onClick={refresh}
            disabled={!answer}
            className="font-bold text-(--crm-text) hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
          {source === "hub" && context && <HubSignOutButton onSignedOut={reload} />}
        </div>
      </header>

      {source === "fixture" && (
        <p className="mb-4 text-[11px] text-(--crm-text-secondary)">
          Sample data · Development preview, not connected to Odoo or WhatsMax. Nothing is sent.
        </p>
      )}

      {/* The writeup's front-desk search: opens the shell's command bar (people, leads, pages) */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
        className="mb-4 flex h-14 w-full items-center gap-3 rounded-2xl border border-(--crm-line) bg-(--crm-panel) px-4 text-start text-[15px] text-(--crm-text-secondary) hover:border-(--crm-muted)"
      >
        <Search size={16} aria-hidden="true" className="text-(--crm-muted)" />
        <span className="min-w-0 flex-1 truncate">Search people, leads or pages…</span>
        <kbd className="rounded-md border border-(--crm-line) bg-(--crm-raised) px-1.5 py-0.5 font-(family-name:--crm-font-label) text-[10px] font-bold text-(--crm-text-secondary)">
          ⌘K
        </kbd>
      </button>

      {needsSignIn ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <StaffSignIn onSignedIn={reload} />
        </div>
      ) : !answer ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <LoadingBlock label="Loading the front desk…" />
        </div>
      ) : answer.outcome === "unavailable" ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <ErrorBlock message={answer.text} onRetry={refresh} />
        </div>
      ) : (
        <div className="space-y-4">
          <nav aria-label="Front desk quick actions" className="flex flex-wrap gap-2">{[["/people", "Find a member"], ["/crm", "Find a lead"], ["/crm/follow-ups", "Review follow-ups"], ["/inbox", "Open communications"]].map(([href, label]) => <Link key={href} href={href} className="rounded-lg border border-(--crm-line) bg-(--crm-panel) px-4 py-2 text-[12px] font-semibold text-(--crm-text) hover:border-(--crm-muted)">{label}</Link>)}</nav>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <ActiveContext item={active} hubMode={source==="hub"} sessionId={sessionId} onAuthenticationLost={authenticationLost} onRefresh={refresh} />
          <ServiceQueue
            context={answer.context}
            selectedId={activeMessageId}
            onSelect={(message) =>
              setChosen(
                message.memberId ? { kind: "member", memberId: message.memberId, message } : { kind: "message", message },
              )
            }
          />
          </div>
          <CrmAttention crm={safeCrm} />
        </div>
      )}
    </div>
  );
}
