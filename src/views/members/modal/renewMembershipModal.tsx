import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { RenewalMember } from "../../../types/renewals";
import { PAYMENT_OPTIONS, RENEWAL_PLAN_OPTIONS } from "../../../utils/json/renewalsData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import DaysPill from "../daysPill";

/*
   Renew Membership — ported from #modal-renew in tailwind/src/renewals.html
   and openRenew()/updateRenewAmt()/confirmRenew() in assets/js/renewals.js.

   The amount tracks the selected plan, which the template read from each
   <option>'s data-price attribute.
*/

const PLAN_OPTIONS = RENEWAL_PLAN_OPTIONS.map((plan) => ({
  value: plan.label,
  label: plan.label,
}));

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type RenewMembershipModalProps = {
  member: RenewalMember | null;
  onClose: () => void;
  onConfirm: (member: RenewalMember) => void;
};

const RenewMembershipModal = ({ member, onClose, onConfirm }: RenewMembershipModalProps) => {
  const [planLabel, setPlanLabel] = useState(RENEWAL_PLAN_OPTIONS[0].label);
  const [pay, setPay] = useState(PAYMENT_OPTIONS[0]);

  const price =
    RENEWAL_PLAN_OPTIONS.find((plan) => plan.label === planLabel)?.price ?? 0;

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title="Renew Membership"
      boxClassName="glass"
      titleClassName="text-base"
    >
      <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
        <div className={`ren-avatar av ${member ? leadAvatar(member.id) : "av-gold"}`}>
          {member ? initials(member.name) : "--"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold c-text">{member?.name ?? "—"}</div>
          <div className="text-[11px] c-dim">
            {member ? `Current: ${member.plan}` : "—"}
          </div>
        </div>
        <DaysPill member={member} />
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold mb-1.5 c-text2">Renewal Plan</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Renewal plan"
            options={PLAN_OPTIONS}
            value={planLabel}
            onChange={(option) => setPlanLabel(option?.value ?? RENEWAL_PLAN_OPTIONS[0].label)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Payment</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Payment method"
              options={toOptions(PAYMENT_OPTIONS)}
              value={pay}
              onChange={(option) => setPay(option?.value ?? PAYMENT_OPTIONS[0])}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Amount</label>
            {/* A read-only display styled like the inputs beside it. */}
            <div className="fp-input py-2.5 text-sm font-bold gt">{moneyWhole(price)}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => member && onConfirm(member)}
        >
          <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Confirm Renewal
        </button>
      </div>
    </Modal>
  );
};

export default RenewMembershipModal;
