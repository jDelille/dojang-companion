import type { CheckinMember } from "../../types/checkin";
import { MEMBER_STATE_BADGE, MEMBER_STATE_LABEL } from "../../utils/json/checkinData";

/*
   One member row in the lookup results.

   Ported from resultHtml() in tailwind/src/assets/js/checkin.js, which built
   the same markup for both the inline list and the search modal. An expired
   membership dims and disables the Check-In button.
*/

type CheckinResultProps = {
  member: CheckinMember;
  onCheckIn: (member: CheckinMember) => void;
};

const CheckinResult = ({ member, onCheckIn }: CheckinResultProps) => {
  const disabled = member.status === "expired";

  return (
    <div className="ci-result">
      <div className={`ci-av ci-av-md ${member.tint}`}>{member.initials}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold c-text truncate">{member.name}</div>
        <div className="text-[11px] c-dim">
          {member.plan} · {member.mid}
        </div>
      </div>
      <span
        className={`${MEMBER_STATE_BADGE[member.status]} text-[10px] font-bold px-2 py-0.5 rounded-full`}
      >
        {MEMBER_STATE_LABEL[member.status]}
      </span>
      <button
        type="button"
        className={`btn-gold px-3 py-1.5 text-[11px] font-bold ${
          disabled ? "opacity-40 pointer-events-none" : ""
        }`}
        disabled={disabled}
        onClick={() => onCheckIn(member)}
      >
        Check-In
      </button>
    </div>
  );
};

export default CheckinResult;
