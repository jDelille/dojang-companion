"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { SessionRoster } from "@/domain/arrivals";
import { roleLabel } from "@/domain/staff";
import {
  coverageOf,
  decisionCount,
  countText,
  deliveryProblems,
  dueFollowUps,
  leadsNeedingNextAction,
  messageWork,
  remainingToday,
  ROSTER_LIMIT,
  type TodayCrmRead,
  type TodayWork,
} from "@/domain/today";
import {
  getInboxContext,
  getSessionRoster,
  SIGN_IN_CODES,
  type InboxContextAnswer,
  type SessionRosterAnswer,
} from "@/integrations/hub";
import { DoForMeFocus } from "@/views/doForMe/doForMeProvider";
import { ErrorBlock, LoadingBlock } from "@/views/inbox/inboxStates";
import { HubSignOutButton } from "@/views/shell/hubUnavailable";
import StaffSignIn from "@/views/shell/staffSignIn";
import NeedsDecision from "./needsDecision";
import TodayClasses from "./todayClasses";
import { todayRailContext } from "./todayRail";

/*
   Today (CRM screen C01; the WhatsMax writeup's Home: "a decision surface, not
   a reporting surface"):

     TODAY · role · date                                 [Refresh]
     Good afternoon, Jamie. 4 need a decision.
     [Needs decision]
     [Still to come today]                              [Do For Me: Today context]

   A composition of reads DreamOS already makes, never a new source of truth:
   - the Hub's context read (the Inbox's getInboxContext): today's classes,
     guardian messages and their deliveries
   - the Hub's session_roster per class (getSessionRoster): instructor, booked,
     here, not arrived
   - crm_context, read on the server by the page: CRM tasks and lead evidence
     (owners and managers; "forbidden" leaves the CRM rows out)
   Read-only. Business pulse, Watching and approvals aren't shown: Odoo sends
   nothing DreamOS could build them from honestly.
*/

const noSubscription = () => () => {};

// Worked out in the browser only (the server renders without them)
function useBrowserText(format: () => string) {
  return useSyncExternalStore(noSubscription, format, () => "");
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const sectionLabel =
  "font-(family-name:--crm-font-label) text-[10px] font-bold uppercase tracking-[0.16em] text-(--crm-muted)";

export default function Today({ crm, source }: { crm: TodayCrmRead; source: "hub" | "fixture" }) {
  const router = useRouter();
  const [answer, setAnswer] = useState<InboxContextAnswer | null>(null); // null while loading
  const [rosters, setRosters] = useState<Record<string, SessionRosterAnswer | undefined>>({});
  const [reads, setReads] = useState(0); // counts reloads, so rosters are read again
  const date = useBrowserText(() =>
    new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }),
  );
  const greeting = useBrowserText(() => greetingFor(new Date().getHours()));

  // The first read, when the page opens
  useEffect(() => {
    let cancelled = false;
    getInboxContext().then((next) => {
      if (!cancelled) setAnswer(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read everything again (Refresh, after sign-in or sign-out)
  const reload = useCallback(async () => {
    setAnswer(null);
    setRosters({});
    setReads((count) => count + 1);
    setAnswer(await getInboxContext());
  }, []);

  const context = answer?.outcome === "loaded" ? answer.context : null;
  const needsSignIn = answer?.outcome === "unavailable" && SIGN_IN_CODES.includes(answer.code ?? "");
  const sessions = context ? remainingToday(context) : [];
  const rosterIds = sessions
    .slice(0, ROSTER_LIMIT)
    .map((session) => session.id)
    .join(",");

  // Each of today's classes' roster, read side by side
  useEffect(() => {
    if (!rosterIds) return;
    let cancelled = false;
    for (const id of rosterIds.split(",")) {
      getSessionRoster(id).then((next) => {
        if (!cancelled) setRosters((current) => ({ ...current, [id]: next }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [rosterIds, reads]);

  function refresh() {
    void reload();
    router.refresh(); // the server's CRM read too
  }

  // The rosters as coverage needs them: undefined while loading, null when unavailable
  const readRosters: Record<string, SessionRoster | null | undefined> = {};
  for (const [id, roster] of Object.entries(rosters)) {
    readRosters[id] = roster?.outcome === "loaded" ? roster.roster : roster ? null : undefined;
  }
  const rostersPending = sessions.slice(0, ROSTER_LIMIT).some((session) => rosters[session.id] === undefined);
  const crmContext = crm.outcome === "loaded" ? crm.context : null;
  const work: TodayWork = {
    coverage: context ? coverageOf(sessions, readRosters) : null,
    rostersPending,
    messages: context ? messageWork(context) : null,
    deliveries: context ? deliveryProblems(context) : null,
    due: crmContext ? dueFollowUps(crmContext) : null,
    noNextAction: crmContext ? leadsNeedingNextAction(crmContext) : null,
  };
  // Every read has answered (the context, and the rosters if it loaded)
  const settled = answer !== null && !rostersPending;
  const { count, partial } = decisionCount(work);
  const name = context?.principal.name;

  return (
    <div className="crm-scope">
      {answer && !needsSignIn && <DoForMeFocus focusKey="today" context={todayRailContext(work, settled)} />}

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={sectionLabel}>
            Today
            {context && ` · ${roleLabel(context.principal.role)}`}
            {date && ` · ${date}`}
          </p>
          <h1 className="mt-2 text-[22px] font-bold leading-tight text-(--crm-text)">
            {greeting ? `${greeting}${name ? `, ${name}` : ""}.` : "Today."}{" "}
            {settled && !needsSignIn && answer?.outcome === "loaded" && (
              <span className="text-(--crm-text-secondary)">
                {count === 0 ? "Here's your day." : `${countText(count, partial)} need a decision.`}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-(--crm-text-secondary)">
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

      {needsSignIn ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <StaffSignIn onSignedIn={refresh} />
        </div>
      ) : !answer ? (
        <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
          <LoadingBlock label="Loading today…" />
        </div>
      ) : (
        <div className="grid gap-4">
          <NeedsDecision
            work={work}
            crm={crm}
            contextFailure={answer.outcome === "unavailable" ? answer.text : null}
            onRetry={refresh}
          />
          {answer.outcome === "loaded" ? (
            <TodayClasses sessions={sessions} rosters={rosters} />
          ) : (
            <div className="rounded-2xl border border-(--crm-line) bg-(--crm-panel)">
              <ErrorBlock message={`Today's classes couldn't be read. ${answer.text}`} onRetry={refresh} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
