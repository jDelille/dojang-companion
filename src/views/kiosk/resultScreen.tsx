import type { AttendanceReceipt, RosterMember, SessionOption } from "@/contracts/kiosk-attendance";
import type { CheckInOutcome } from "@/domain/kiosk/checkInOutcome";
import { formatClockTime } from "@/domain/kiosk/sessionFormat";
import SessionHeader from "./sessionHeader";
import StatusMessage, { type StatusAction } from "./statusMessage";
import SuccessMark from "./successMark";
import SummaryRow from "./summaryRow";

// K06 Result: only ever shown after the server answered (or clearly didn't).
// No Back: the only ways out are Done, or the action the outcome offers.
// Ported from Companion's components/kiosk/screens/result-screen. Not here yet:
// "Get help from staff" with "see the front desk" (opens the Concierge in Companion).

type ResultScreenProps = {
  session: SessionOption;
  member: RosterMember;
  outcome: CheckInOutcome;
  onDone: () => void;
  onRetry: () => void; // only offered when not confirmed
  onChooseClass: () => void; // only offered when this class can't take check-ins
};

const headlineClass =
  "text-[2rem] leading-[1.1] font-bold tracking-[-0.04em] @min-[540px]:text-[3rem]";

const ResultScreen = ({ session, member, outcome, onDone, onRetry, onChooseClass }: ResultScreenProps) => {
  return (
    <div className="flex flex-col gap-6 py-8">
      {outcome.kind !== "success" && outcome.kind !== "alreadyCheckedIn" && (
        <SessionHeader session={session} />
      )}

      {outcome.kind === "success" && (
        <Receipt
          headline="You're checked in"
          animate
          session={session}
          member={member}
          receipt={outcome.receipt}
          onDone={onDone}
        />
      )}

      {outcome.kind === "alreadyCheckedIn" && (
        <Receipt
          headline="You're already checked in"
          animate={false}
          session={session}
          member={member}
          receipt={outcome.receipt}
          onDone={onDone}
        />
      )}

      {outcome.kind === "seeFrontDesk" && (
        <Refusal
          headline="Please see the front desk"
          message="We couldn't finish your check-in here."
          actions={[{ label: "Done", onClick: onDone }]}
        />
      )}

      {outcome.kind === "chooseAnotherClass" && (
        <Refusal
          headline="This class can't take check-ins"
          message="Please choose a class from today's list."
          actions={[
            { label: "Choose a class", onClick: onChooseClass },
            { label: "Done", onClick: onDone },
          ]}
        />
      )}

      {outcome.kind === "kioskUnavailable" && (
        <Refusal
          headline="Check-in isn't available here"
          message="This kiosk can't check you in right now."
          detail="Please see the front desk."
          actions={[{ label: "Done", onClick: onDone }]}
        />
      )}

      {/* It may still have gone through, so never say it failed */}
      {outcome.kind === "notConfirmed" && (
        <Refusal
          headline="Check-in not confirmed"
          message="We couldn't confirm your check-in."
          detail="Try again, or see the front desk."
          actions={[
            { label: "Try again", onClick: onRetry },
            { label: "Done", onClick: onDone },
          ]}
        />
      )}
    </div>
  );
};

type ReceiptProps = {
  headline: string;
  animate: boolean;
  session: SessionOption;
  member: RosterMember;
  receipt: AttendanceReceipt;
  onDone: () => void;
};

// Success and already-checked-in: the receipt always names the selected session
const Receipt = ({ headline, animate, session, member, receipt, onDone }: ReceiptProps) => {
  return (
    <>
      <div className="mt-4 mb-2 flex flex-col items-start gap-2" role="status" aria-live="polite" aria-atomic="true">
        <SuccessMark animate={animate} />
        <h1 className={`mt-2 ${headlineClass}`}>{headline}</h1>
      </div>

      <dl className="flex flex-col gap-3 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-canvas) p-6">
        <SummaryRow label="Student">{member.displayName}</SummaryRow>
        <SummaryRow label="Class">{session.title}</SummaryRow>
        <SummaryRow label="Time">{formatClockTime(session.startsAt)}</SummaryRow>
        <SummaryRow label="Checked in at">
          {formatClockTime(receipt.checkedInAt)}
          {/* Neutral, just information: not a warning */}
          {receipt.status === "late" && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--kiosk-warning)_15%,transparent)] px-3 py-1 text-base font-semibold text-(--kiosk-warning)">
              Late
            </span>
          )}
        </SummaryRow>
      </dl>

      <div className="flex flex-col items-stretch gap-3">
        <button
          type="button"
          onClick={onDone}
          className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl bg-(--kiosk-brand) px-8 text-[1.875rem] font-semibold text-(--kiosk-text) transition-colors hover:bg-(--kiosk-brand-bright) focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--kiosk-text-secondary) active:bg-(--kiosk-brand-bright)"
        >
          Done
        </button>
        <p className="text-center text-base text-(--kiosk-muted)">Clears the screen for the next person</p>
      </div>
    </>
  );
};

type RefusalProps = {
  headline: string;
  message: string;
  detail?: string;
  actions: StatusAction[];
};

// Everything that isn't a receipt: neutral wording, never a reason
const Refusal = ({ headline, message, detail, actions }: RefusalProps) => {
  return (
    <>
      <div className="mt-4 flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.08em] text-(--kiosk-text-secondary) uppercase">Check-in</p>
        <h1 className={headlineClass}>{headline}</h1>
      </div>
      <StatusMessage message={message} detail={detail} actions={actions} />
    </>
  );
};

export default ResultScreen;
