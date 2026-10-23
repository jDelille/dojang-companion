import { useEffect, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { MembershipPlan } from "../../../types/membershipPlans";
import { ASSIGN_MEMBERS, PAYMENT_OPTIONS } from "../../../utils/json/membershipPlansData";
import { moneyWhole } from "../../../utils/formatUtils";

/*
   Assign Plan — ported from #modal-assign-plan in
   tailwind/src/membership-plans.html and openAssign()/assignPlan() in
   assets/js/membership-plans.js.

   Raw markup rather than components/common/Modal because the header carries a
   gold icon tile beside the title.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

/* The template ships the date field pre-filled with this value. */
const DEFAULT_START = new Date(2026, 6, 14);

type AssignPlanModalProps = {
  plan: MembershipPlan | null;
  onClose: () => void;
  onAssign: (plan: MembershipPlan, member: string) => void;
};

const AssignPlanModal = ({ plan, onClose, onAssign }: AssignPlanModalProps) => {
  const open = plan !== null;
  const [member, setMember] = useState(ASSIGN_MEMBERS[0]);
  const [start, setStart] = useState<Date | null>(DEFAULT_START);
  const [pay, setPay] = useState(PAYMENT_OPTIONS[0]);

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
            <div className="icon-box w-9! h-9! grad-gold">
              <UserPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Assign Plan</h3>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl emoji-tile text-xl">{plan?.emoji ?? "⭐"}</div>
          <div className="flex-1">
            <div className="text-sm font-bold c-text">{plan?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {plan ? `${moneyWhole(plan.price)} / ${plan.dur}` : "—"}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={toOptions(ASSIGN_MEMBERS)}
              value={member}
              onChange={(option) => setMember(option?.value ?? ASSIGN_MEMBERS[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Start Date</label>
              <CommonDatePicker
                className="py-2.5 text-sm"
                dateFormat="d M, yy"
                ariaLabel="Start date"
                value={start}
                onChange={(e) => setStart((e.value as Date) ?? null)}
              />
            </div>
            <div>
              <label className="f-label">Payment</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Payment method"
                options={toOptions(PAYMENT_OPTIONS)}
                value={pay}
                onChange={(option) => setPay(option?.value ?? PAYMENT_OPTIONS[0])}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => plan && onAssign(plan, member)}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign &amp; Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPlanModal;
