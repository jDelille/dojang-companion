import { useEffect, useState } from "react";
import { CheckCircle, UserPlus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { DayPass } from "../../../types/dayPasses";
import { CONVERT_PLANS, PAYMENT_OPTIONS } from "../../../utils/json/dayPassesData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";

/*
   Convert to Member — ported from #modal-convert in
   tailwind/src/day-passes.html and openConvert()/updateConvertAmt()/
   confirmConvert() in assets/js/day-passes.js.

   Crediting today's pass fee subtracts it from the plan price, floored at
   zero, which is what updateConvertAmt() computed.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const PLAN_OPTIONS = CONVERT_PLANS.map((plan) => ({
  value: plan.label,
  label: plan.label,
}));

type ConvertPassModalProps = {
  pass: DayPass | null;
  onClose: () => void;
  onConvert: (pass: DayPass) => void;
};

const ConvertPassModal = ({ pass, onClose, onConvert }: ConvertPassModalProps) => {
  const open = pass !== null;
  const [planLabel, setPlanLabel] = useState(CONVERT_PLANS[0].label);
  const [pay, setPay] = useState(PAYMENT_OPTIONS[0]);
  const [credit, setCredit] = useState(true);

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

  const planPrice =
    CONVERT_PLANS.find((plan) => plan.label === planLabel)?.price ?? 0;
  const payable = credit && pass ? Math.max(0, planPrice - pass.fee) : planPrice;

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-gold ic-38">
              <UserPlus className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Convert to Member</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
          <div className={`dp-avatar av ${pass ? leadAvatar(pass.id) : "av-gold"}`}>
            {pass ? initials(pass.name) : "--"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold c-text">{pass?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {pass ? `${pass.type}${pass.ref ? ` · via ${pass.ref}` : ""}` : "—"}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1.5 c-text2">Membership Plan</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Membership plan"
              options={PLAN_OPTIONS}
              value={planLabel}
              onChange={(option) => setPlanLabel(option?.value ?? CONVERT_PLANS[0].label)}
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
              <label className="block text-xs font-bold mb-1.5 c-text2">Payable</label>
              {/* Read-only display styled like the field beside it. */}
              <div className="fp-input py-2.5 text-sm font-bold gt">
                {moneyWhole(payable)}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-gold"
              checked={credit}
              onChange={(e) => setCredit(e.target.checked)}
            />
            <span className="text-xs c-dim">
              Credit today&apos;s pass fee (
              <span>{pass?.fee ? moneyWhole(pass.fee) : "$0"}</span>) toward membership
            </span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => pass && onConvert(pass)}
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Enroll Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertPassModal;
