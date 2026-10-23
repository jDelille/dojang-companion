import { Check, Gift } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Referral } from "../../../types/referrals";
import { REFERRAL_STATUS_BADGE } from "../../../utils/json/referralsData";
import { avatarFor, initials, moneyWhole } from "../../../utils/formatUtils";

/*
   Referral Details — ported from #modal-view in tailwind/src/referrals.html
   and openView() in assets/js/referrals.js.
*/

type ReferralViewModalProps = {
  referral: Referral | null;
  onClose: () => void;
  onApprove: (referral: Referral) => void;
  onReward: (referral: Referral) => void;
};

const ReferralViewModal = ({
  referral,
  onClose,
  onApprove,
  onReward,
}: ReferralViewModalProps) => (
  <Modal
    open={referral !== null}
    onClose={onClose}
    title="Referral Details"
    boxClassName="glass modal-w-420"
    titleClassName="text-base"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
      <div
        className={`ref-avatar av ${referral ? avatarFor(referral.friend) : "av-gold"} w-12! h-12! rounded-xl`}
      >
        {referral ? initials(referral.friend) : "--"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black c-text">{referral?.friend ?? "—"}</div>
        <div className="text-[11px] c-dim">
          {referral ? `Referred by ${referral.by}` : "—"}
        </div>
      </div>
      <span
        className={`badge ${referral ? REFERRAL_STATUS_BADGE[referral.status] : "badge-present"}`}
      >
        <span className="dot" />
        {referral?.status ?? "—"}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="tr-row block!">
        <div className="f-label">Date</div>
        <div className="text-sm font-bold c-text">{referral?.date ?? "—"}</div>
      </div>
      <div className="tr-row block!">
        <div className="f-label">Reward</div>
        <div className="text-sm font-bold gt">
          {referral?.reward ? moneyWhole(referral.reward) : "—"}
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => referral && onApprove(referral)}
      >
        <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Approve
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
        onClick={() => referral && onReward(referral)}
      >
        <Gift className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Reward
      </button>
    </div>
  </Modal>
);

export default ReferralViewModal;
