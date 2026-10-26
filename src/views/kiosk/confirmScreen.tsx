import type { RosterMember, SessionOption } from "@/contracts/kiosk-attendance";
import { formatStartTime } from "@/domain/kiosk/sessionFormat";
import PlainButton from "./plainButton";
import SessionHeader from "./sessionHeader";
import SummaryRow from "./summaryRow";

// K05 Confirm: student -> class, one committing action.
// Ported from Companion's components/kiosk/screens/confirm-screen. Eligibility (K04)
// has no pre-check in the contract, so it comes back from the check-in itself.

type ConfirmScreenProps = {
  session: SessionOption;
  member: RosterMember;
  isSending: boolean; // request in flight: everything locks
  onConfirm: () => void;
  onBack: () => void;
  onChangeSession: () => void;
};

const ConfirmScreen = ({
  session,
  member,
  isSending,
  onConfirm,
  onBack,
  onChangeSession,
}: ConfirmScreenProps) => {
  const { time, period } = formatStartTime(session.startsAt, session.timeZone);

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex min-h-12 items-center">
        <PlainButton flush onClick={onBack} disabled={isSending}>
          ← Back
        </PlainButton>
      </div>

      <SessionHeader session={session} onChangeSession={onChangeSession} changeDisabled={isSending} />

      <h1 className="mt-4 text-[2rem] leading-[1.1] font-bold tracking-[-0.04em] @min-[540px]:text-[3rem]">
        Check in
      </h1>

      <dl className="flex flex-col gap-3 rounded-2xl border border-(--kiosk-line) bg-(--kiosk-canvas) p-6">
        <SummaryRow label="Student">{member.displayName}</SummaryRow>
        <SummaryRow label="Class">
          {session.title} · {time} {period}
        </SummaryRow>
      </dl>

      {/* The one committing action on this screen */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isSending}
        className="flex min-h-20 w-full cursor-pointer items-center justify-center rounded-2xl bg-(--kiosk-brand) px-8 text-[1.875rem] font-semibold text-(--kiosk-text) transition-[background-color,opacity] hover:bg-(--kiosk-brand-bright) focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--kiosk-text-secondary) active:bg-(--kiosk-brand-bright) disabled:cursor-default disabled:bg-(--kiosk-brand) disabled:opacity-60"
      >
        {isSending ? "Checking in…" : "Confirm check-in"}
      </button>

      {/* The button's text changes silently; this tells screen readers it's working */}
      <p className="sr-only" role="status">
        {isSending ? "Checking in, please wait." : ""}
      </p>
    </div>
  );
};

export default ConfirmScreen;
