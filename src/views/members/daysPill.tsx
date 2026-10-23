import type { RenewalMember } from "../../types/renewals";

/*
   Expiry pill shown in the renewals table and in several of its modals.

   Ported from daysPill() in tailwind/src/assets/js/renewals.js, which built
   the same three variants as an HTML string and re-injected it per modal.
*/

type DaysPillProps = {
  member: RenewalMember | null;
};

const DaysPill = ({ member }: DaysPillProps) => {
  if (!member) return <span className="days-pill d-soon">—</span>;

  if (member.stage === "Renewed") {
    return <span className="days-pill d-ok">Renewed</span>;
  }

  if (member.days < 0) {
    // Past -14 days the membership counts as lapsed rather than merely overdue.
    const variant = member.days < -14 ? "d-lapsed" : "d-urgent";
    return <span className={`days-pill ${variant}`}>{Math.abs(member.days)}d overdue</span>;
  }

  return (
    <span className={`days-pill ${member.days <= 7 ? "d-urgent" : "d-soon"}`}>
      {member.days}d left
    </span>
  );
};

export default DaysPill;
