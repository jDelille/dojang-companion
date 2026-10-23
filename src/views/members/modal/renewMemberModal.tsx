import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Member, PayMethod, PlanLabel } from "../../../types/members";
import { PLAN_OPTIONS, PLAN_PRICE } from "../../../utils/json/membersData";
import { moneyWhole } from "../../../utils/formatUtils";

/*
   Renew Membership — ported from #modal-renew in tailwind/src/members.html
   and openRenew()/updateRenewAmount()/confirmRenew() in assets/js/members.js.

   The amount tracks the selected plan, matching updateRenewAmount()'s change
   handler. Keyed by member id in the page, so the plan re-seeds per member.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const METHOD_OPTIONS = toOptions(["Cash", "Card", "Apple Pay", "Wallet"]);

type RenewMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member, plan: PlanLabel) => void;
};

const RenewMemberModal = ({ member, onClose, onConfirm }: RenewMemberModalProps) => {
  const [plan, setPlan] = useState<PlanLabel>(member?.planLabel ?? "Annual Premium");
  /* Captured like the template's #rn-method, which collects the method but
     does not surface it in the confirmation toast. */
  const [method, setMethod] = useState<PayMethod>("Cash");

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title="Renew Membership"
      closeClassName="modal-x"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4">
        <div className="text-sm font-bold c-text">
          {member ? `${member.first} ${member.last}` : "—"}
        </div>
        <div className="text-[11px] c-dim">
          {member ? `${member.id} · expires ${member.expiresDisp}` : "—"}
        </div>
      </div>
      <div className="mb-3">
        <label className="f-label">Plan</label>
        <CommonSelect
          ariaLabel="Plan"
          options={toOptions(PLAN_OPTIONS)}
          value={plan}
          onChange={(option) => setPlan((option?.value as PlanLabel) ?? "Annual Premium")}
        />
      </div>
      <div className="mb-4">
        <label className="f-label">Payment Method</label>
        <CommonSelect
          ariaLabel="Payment method"
          options={METHOD_OPTIONS}
          value={method}
          onChange={(option) => setMethod((option?.value as PayMethod) ?? "Cash")}
        />
      </div>
      <div className="amount-box mb-4">
        <span className="text-xs c-dim font-semibold">Amount Payable</span>
        <span className="text-lg font-black gt">{moneyWhole(PLAN_PRICE[plan] ?? 0)}</span>
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => member && onConfirm(member, plan)}
        >
          <RefreshCw className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Renew &amp; Collect
        </button>
      </div>
    </Modal>
  );
};

export default RenewMemberModal;
