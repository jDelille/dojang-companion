import { MessageCircle, Phone, RefreshCw } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { RenewalMember, RenewalStage } from "../../../types/renewals";
import { RENEWAL_STAGES } from "../../../utils/json/renewalsData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import DaysPill from "../daysPill";

/*
   Follow Up — ported from #modal-followup in tailwind/src/renewals.html and
   openFollow() plus the modal's click handler in assets/js/renewals.js.

   The stage buttons render gold for the member's current stage; Call and SMS
   also advance the stage, while Renew hands off to the renew modal.
*/

type FollowUpModalProps = {
  member: RenewalMember | null;
  onClose: () => void;
  onStage: (member: RenewalMember, stage: RenewalStage) => void;
  onCall: (member: RenewalMember) => void;
  onMessage: (member: RenewalMember) => void;
  onRenew: (member: RenewalMember) => void;
};

const FollowUpModal = ({
  member,
  onClose,
  onStage,
  onCall,
  onMessage,
  onRenew,
}: FollowUpModalProps) => (
  <Modal
    open={member !== null}
    onClose={onClose}
    title="Follow Up"
    boxClassName="glass"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
      <div
        className={`ren-avatar av ${member ? leadAvatar(member.id) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
      >
        {member ? initials(member.name) : "--"}
      </div>
      <div className="flex-1">
        <div className="text-sm font-black c-text">{member?.name ?? "—"}</div>
        <div className="text-[11px] c-dim">
          {member ? `${member.plan} · ${moneyWhole(member.value)}` : "—"}
        </div>
      </div>
      <DaysPill member={member} />
    </div>
    <div className="mb-2 text-[10px] font-black uppercase tracking-wider c-dim2">
      Move to stage
    </div>
    <div className="grid grid-cols-4 gap-2 mb-4">
      {RENEWAL_STAGES.map((stage) => (
        <button
          key={stage.key}
          type="button"
          className={`${stage.key === member?.stage ? "btn-gold" : "btn-ghost"} py-2 text-[11px]`}
          onClick={() => member && onStage(member, stage.key)}
        >
          {stage.short}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        className="btn-ghost py-2.5 text-xs flex items-center justify-center gap-1.5"
        onClick={() => member && onCall(member)}
      >
        <Phone className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Call
      </button>
      <button
        type="button"
        className="btn-ghost py-2.5 text-xs flex items-center justify-center gap-1.5"
        onClick={() => member && onMessage(member)}
      >
        <MessageCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        SMS
      </button>
      <button
        type="button"
        className="btn-gold py-2.5 text-xs flex items-center justify-center gap-1.5"
        onClick={() => member && onRenew(member)}
      >
        <RefreshCw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Renew
      </button>
    </div>
  </Modal>
);

export default FollowUpModal;
