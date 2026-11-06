"use client";

import { useEffect, useReducer, useState } from "react";
import Link from 'next/link';
import type { KioskDataMode } from '@/domain/kiosk/dataMode';
import { checkInFlowReducer, initialCheckInFlow } from "@/domain/kiosk/checkInFlow";
import { createCheckInCommand } from "@/domain/kiosk/checkInCommand";
import { outcomeFor } from "@/domain/kiosk/checkInOutcome";
import {
  IDLE_TIMEOUT_SECONDS,
  IDLE_WARNING_SECONDS,
  RESULT_AUTO_RETURN_SECONDS,
  SCHOOL_NAME,
} from "@/domain/kiosk/kioskConfig";
import { searchRoster } from "@/domain/kiosk/rosterSearch";
import { checkIn, getRoster, getSessions } from "@/integrations/kiosk";
import {startAttendanceRecovery} from '@/integrations/attendanceRecovery';
import GuardianCheckIn from './guardianCheckIn';
import ConfirmScreen from "./confirmScreen";
import IdentifyScreen from "./identifyScreen";
import { idleTimerShouldRun } from "./idleTimer";
import IdleWarning from "./idleWarning";
import KioskHeader from "./kioskHeader";
import ResultScreen from "./resultScreen";
import { ROSTER_GRID } from "./rosterGrid";
import SessionSelectScreen from "./sessionSelectScreen";
import StatusMessage from "./statusMessage";
import { useIdleTimer } from "./useIdleTimer";
import WelcomeScreen from "./welcomeScreen";

// The whole public check-in flow on one page, no route per screen (privacy: no
// URL history to restore a previous attendee). Ported from Companion's
// app/(kiosk)/kiosk/page.tsx: Welcome (K01), Choose class (K02), Identify (K03),
// Confirm (K05; eligibility, K04, comes back from the check-in), Result (K06)
// and the privacy resets (K07).
const KioskJourney = ({ source = 'fixture' }: { source?: KioskDataMode }) => {
  const [recovery,setRecovery]=useState('');
  useEffect(()=>{if(source==='odoo-test')return startAttendanceRecovery(setRecovery);},[source]);
  const [guardian,setGuardian]=useState(false);
  const [familyArrival,setFamilyArrival]=useState(false),[staffHelp,setStaffHelp]=useState(false);
  const [flow, dispatch] = useReducer(checkInFlowReducer, initialCheckInFlow);

  // Fetch today's sessions whenever the session step is loading (first visit or Try again)
  const isLoadingSessions = flow.step === "session" && flow.sessions.status === "loading";

  useEffect(() => {
    if (!isLoadingSessions) return;

    // If they leave before it answers (Back), cancel it and ignore any late answer
    let cancelled = false;
    const controller = new AbortController();
    getSessions(controller.signal)
      .then((sessions) => {
        if (!cancelled) dispatch({ type: "sessionsLoaded", sessions });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "sessionsFailed" });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isLoadingSessions]);

  // Fetch the selected session's roster whenever the identify step is loading
  const rosterSessionId =
    flow.step === "identify" && flow.roster.status === "loading" ? flow.session.sessionId : null;

  useEffect(() => {
    if (!rosterSessionId || source === 'unavailable') return;

    // Same late-response guard as sessions. The reducer also checks the sessionId.
    let cancelled = false;
    const controller = new AbortController();
    getRoster(rosterSessionId, controller.signal)
      .then((roster) => {
        if (!cancelled) dispatch({ type: "rosterLoaded", sessionId: rosterSessionId, roster });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "rosterFailed", sessionId: rosterSessionId });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [rosterSessionId, source]);

  // Send the check-in while on the sending step. The command object stays the
  // same for the whole step, so this runs once per attempt.
  const pendingCommand = flow.step === "sending" ? flow.command : null;

  useEffect(() => {
    if (!pendingCommand) return;

    // Leaving the step cancels the request for real, and its answer is dropped.
    // (A timeout inside checkIn() is different: that answer still arrives, as "not confirmed".)
    let cancelled = false;
    const controller = new AbortController();

    checkIn(pendingCommand, controller.signal).then((answer) => {
      if (cancelled) return;
      dispatch({
        type: "checkInAnswered",
        correlationId: pendingCommand.correlationId,
        outcome: outcomeFor(answer, pendingCommand),
      });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pendingCommand]);

  // Confirm tapped: build the command once, here, with fresh ids. A retry after
  // "not confirmed" never comes back here; the reducer resends the stored command.
  const handleConfirm = () => {
    if (flow.step !== "confirm") return;
    const command = createCheckInCommand(flow.session, flow.member);
    if (command) {
      dispatch({ type: "submitCheckIn", command });
    } else {
      dispatch({ type: "commandRejected" });
    }
  };

  // K07: success and already-checked-in go back to Welcome on their own
  const autoReturnDue =
    flow.step === "result" &&
    (flow.outcome.kind === "success" || flow.outcome.kind === "alreadyCheckedIn");

  useEffect(() => {
    if (!autoReturnDue) return;

    // Taps don't extend it: the receipt has been seen, the screen is for the next person
    const timer = setTimeout(() => dispatch({ type: "reset" }), RESULT_AUTO_RETURN_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [autoReturnDue]);

  // K07: idle reset. "reset" clears the class, roster, search text and student.
  // Leaving the step a fetch belongs to cancels it, so a late answer can't come back.
  const idle = useIdleTimer({
    active: idleTimerShouldRun(flow),
    restartKey: flow.step,
    timeoutSeconds: IDLE_TIMEOUT_SECONDS,
    warningSeconds: IDLE_WARNING_SECONDS,
    onTimeout: () => {setStaffHelp(false);setGuardian(false);setFamilyArrival(false);dispatch({ type: "reset" });},
  });

  // Coming back through the browser's back/forward cache would restore the
  // last visitor's screen, so start clean instead
  useEffect(() => {
    const resetIfRestored = (event: PageTransitionEvent) => {
      if (event.persisted) {setStaffHelp(false);setGuardian(false);setFamilyArrival(false);dispatch({ type: "reset" });}
    };
    window.addEventListener("pageshow", resetIfRestored);
    return () => window.removeEventListener("pageshow", resetIfRestored);
  }, []);

  // One screen per step
  const renderScreen = () => {
    if(staffHelp)return <StatusMessage message="Please see the front desk" detail="Staff have not been notified automatically. Ask a staff member nearby for help." actions={[{label:'Back',onClick:()=>setStaffHelp(false)}]}/>;
    if (flow.step === "welcome") {
      return (
        <WelcomeScreen
          schoolName={SCHOOL_NAME}
          onCheckIn={()=>{setFamilyArrival(false);dispatch({type:"start"});}}
          onFamily={source==='odoo-test'?()=>{setFamilyArrival(true);dispatch({type:"start"});}:undefined}
          onStaffHelp={()=>setStaffHelp(true)}
        />
      );
    }

    if (flow.step === "session") {
      return (
        <SessionSelectScreen
          sessions={flow.sessions}
          onSelect={(session) => {setGuardian(familyArrival);setFamilyArrival(false);dispatch({ type: "selectSession", session });}}
          onRetry={() => dispatch({ type: "retrySessions" })}
          onBack={() => dispatch({ type: "back" })}
        />
      );
    }

    if (flow.step === "identify") {
      if(guardian&&source==='odoo-test')return <GuardianCheckIn session={flow.session} onCancel={()=>setGuardian(false)} onFinished={()=>{setGuardian(false);dispatch({type:'reset'});}}/>;
      const search =
        flow.roster.status === "ready"
          ? searchRoster(flow.roster.list, flow.query)
          : ({ status: "tooShort" } as const);

      return (
        <>
        <IdentifyScreen
          session={flow.session}
          rosterStatus={flow.roster.status}
          query={flow.query}
          search={search}
          onQueryChange={(query) => dispatch({ type: "searchChanged", query })}
          onSelectMember={(member) => dispatch({ type: "selectMember", member })}
          onStaffHelp={()=>setStaffHelp(true)}
          onRetry={() => dispatch({ type: "retryRoster" })}
          onChangeSession={() => dispatch({ type: "changeSession" })}
          onBack={() => dispatch({ type: "back" })}
          roster={ROSTER_GRID ? (flow.roster.status === "ready" ? flow.roster.list : []) : undefined}
        />
        {source==='odoo-test'&&<button type="button" className="my-5 min-h-12 rounded-full border border-(--kiosk-line) px-5 py-3 text-base" onClick={()=>setGuardian(true)}>Parent check-in with phone and PIN</button>}
        </>
      );
    }

    if (flow.step === "confirm" || flow.step === "sending") {
      return (
        <ConfirmScreen
          session={flow.session}
          member={flow.member}
          isSending={flow.step === "sending"}
          onConfirm={handleConfirm}
          onBack={() => dispatch({ type: "back" })}
          onChangeSession={() => dispatch({ type: "changeSession" })}
        />
      );
    }

    if (flow.step === "result") {
      return (
        <ResultScreen
          session={flow.session}
          member={flow.member}
          outcome={flow.outcome}
          onDone={() => dispatch({ type: "reset" })}
          onRetry={() => dispatch({ type: "retryCheckIn" })}
          onChooseClass={() => dispatch({ type: "changeSession" })}
          onStaffHelp={()=>setStaffHelp(true)}
        />
      );
    }

    // The Concierge isn't part of DreamOS and nothing here opens it. If the flow
    // ever lands on it anyway, offer the one safe way out.
    return (
      <div className="flex flex-1 flex-col justify-center py-8">
        <StatusMessage
          message="This isn't available here."
          actions={[{ label: "Start over", onClick: () => dispatch({ type: "reset" }) }]}
        />
      </div>
    );
  };

  return (
    <>
      <KioskHeader label={staffHelp?'Help':flow.step==='welcome'?'Arrival':flow.step==='session'?'Check in':flow.step==='identify'?'Identify':flow.step==='result'?'Complete':'Review'} disabled={flow.step==='sending'||guardian} onReset={()=>{setStaffHelp(false);setGuardian(false);setFamilyArrival(false);dispatch({type:'reset'});}}/>
      <p className="py-2 text-center text-xs text-(--kiosk-muted)">
        {source === 'fixture' ? 'Development preview · Sample classes and attendance' : source === 'odoo-test'
          ? 'Odoo test connection' : 'Kiosk connection unavailable'}
        {source === 'odoo-test' && <> · <Link href="/integration/pair" className="underline underline-offset-4">Device setup</Link></>}
      </p>
      {recovery&&<p role="status" className="py-3 text-sm text-(--kiosk-text-secondary)">{recovery}</p>}
      {renderScreen()}
      <IdleWarning secondsLeft={idle.secondsLeft} onStillHere={idle.stillHere} />
    </>
  );
};

export default KioskJourney;
