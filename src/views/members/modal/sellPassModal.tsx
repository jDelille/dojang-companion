import { useEffect, useState } from "react";
import { CheckCircle, Ticket, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { DayPass, PassTypeName } from "../../../types/dayPasses";
import { PASS_TYPES, PAYMENT_OPTIONS } from "../../../utils/json/dayPassesData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import { feeOf } from "../useDayPasses";

/*
   Sell Pass — ported from #modal-sell in tailwind/src/day-passes.html and
   openSell()/updateSell()/confirmSell() in assets/js/day-passes.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const TYPE_OPTIONS = PASS_TYPES.map((type) => ({
  value: type.name,
  label: `${type.name} — ${type.fee ? moneyWhole(type.fee) : "Free"}`,
}));

type SellPassModalProps = {
  pass: DayPass | null;
  onClose: () => void;
  onSell: (pass: DayPass, type: PassTypeName, payment: string) => void;
};

const SellPassModal = ({ pass, onClose, onSell }: SellPassModalProps) => {
  const open = pass !== null;
  const [type, setType] = useState<PassTypeName>(pass?.type ?? PASS_TYPES[0].name);
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

  const fee = feeOf(type);

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
            <div className="icon-box ic-gold ic-38">
              <Ticket className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Sell Pass</h3>
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
            <div className="text-[11px] c-dim">{pass ? `Current: ${pass.type}` : "—"}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Pass Type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Pass type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(option) =>
                setType((option?.value as PassTypeName) ?? PASS_TYPES[0].name)
              }
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
        <div className="amount-box mt-4">
          <span className="text-xs c-dim font-semibold">Pass Fee</span>
          <span className="text-lg font-black gt">{fee ? moneyWhole(fee) : "Free"}</span>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => pass && onSell(pass, type, pay)}
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Sell &amp; Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellPassModal;
