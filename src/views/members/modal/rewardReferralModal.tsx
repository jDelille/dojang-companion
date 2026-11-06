import { useEffect, useState } from "react";
import { CheckCircle, Gift, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Referral } from "../../../types/referrals";
import { PAYOUT_OPTIONS, REFERRAL_REWARD } from "../../../utils/json/referralsData";
import { moneyWhole } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Reward Referral — ported from #modal-reward in tailwind/src/referrals.html
   and openReward()/updateRewardTotal()/confirmReward() in
   assets/js/referrals.js.

   Paying also marks the referral converted, as confirmReward() did.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RewardReferralModalProps = {
  referral: Referral | null;
  onClose: () => void;
  onPay: (referral: Referral, amount: number) => void;
};

const RewardReferralModal = ({ referral, onClose, onPay }: RewardReferralModalProps) => {
  const open = referral !== null;
  const [amount, setAmount] = useState(
    String(referral?.reward || REFERRAL_REWARD),
  );
  const [method, setMethod] = useState(PAYOUT_OPTIONS[0]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Gift className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Reward Referral</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box">
          {referral ? `${referral.friend} · referred by ${referral.by}` : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Reward Amount ($)</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Payout</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Payout method"
              options={toOptions(PAYOUT_OPTIONS)}
              value={method}
              onChange={(option) => setMethod(option?.value ?? PAYOUT_OPTIONS[0])}
            />
          </div>
        </div>
        <div className="amount-box mt-4">
          <span className="text-xs c-dim font-semibold">
            Reward to <span>{referral?.by ?? "member"}</span>
          </span>
          <span className="text-lg font-black gt">{moneyWhole(Number(amount) || 0)}</span>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => referral && onPay(referral, Number(amount) || 0)}
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Pay Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardReferralModal;
