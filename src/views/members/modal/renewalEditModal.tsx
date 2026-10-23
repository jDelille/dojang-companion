import { useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import type { RenewalMember, RenewalStage } from "../../../types/renewals";
import { RENEWAL_PLAN_OPTIONS, RENEWAL_STAGES } from "../../../utils/json/renewalsData";
import type { RenewalFormInput } from "../useRenewals";

/*
   Add / Edit Renewal — ported from #modal-edit in tailwind/src/renewals.html
   and openEdit()/saveEdit() in assets/js/renewals.js.

   One modal serves both modes. The plan <option> carried data-price and
   data-period; here those live on RENEWAL_PLAN_OPTIONS, and the plan label is
   split on " — " exactly as saveEdit() did.
*/

const PLAN_OPTIONS = RENEWAL_PLAN_OPTIONS.map((plan) => ({
  value: plan.label,
  label: plan.label,
}));

const STAGE_OPTIONS = RENEWAL_STAGES.map((stage) => ({
  value: stage.key,
  label: stage.key,
}));

/* The template ships the expiry field pre-filled with this value. */
const DEFAULT_EXPIRY = new Date(2026, 7, 1);

type RenewalEditModalProps = {
  open: boolean;
  /** The member being edited, or null when adding. */
  member: RenewalMember | null;
  onClose: () => void;
  onSave: (input: RenewalFormInput) => void;
  /** Called instead of onSave when the name is blank. */
  onInvalid: () => void;
};

const RenewalEditModal = ({
  open,
  member,
  onClose,
  onSave,
  onInvalid,
}: RenewalEditModalProps) => {
  const [name, setName] = useState(member?.name ?? "");
  const [planLabel, setPlanLabel] = useState(RENEWAL_PLAN_OPTIONS[0].label);
  const [expiry, setExpiry] = useState<Date | null>(DEFAULT_EXPIRY);
  const [value, setValue] = useState(member ? String(member.value) : "");
  const [stage, setStage] = useState<RenewalStage>(member?.stage ?? "Not Contacted");

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

  const save = () => {
    const trimmed = name.trim();
    // saveEdit() toasted "Enter a member name" and kept the modal open.
    if (!trimmed) {
      onInvalid();
      return;
    }
    const plan = RENEWAL_PLAN_OPTIONS.find((option) => option.label === planLabel)!;
    onSave({
      id: member?.id ?? null,
      name: trimmed,
      // "Monthly Standard — $49" -> "Monthly Standard"
      plan: plan.label.split(" — ")[0],
      period: plan.period,
      // A blank value field falls back to the plan's own price.
      value: Number(value) || plan.price,
      stage,
    });
    onClose();
  };

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-gold ic-38">
              <CalendarClock
                className="w-[17px] h-[17px] c-gold shrink-0"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-base font-black c-text">
              {member ? "Edit Renewal" : "Add Renewal"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Member Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Marcus Coleman"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Plan</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Plan"
              options={PLAN_OPTIONS}
              value={planLabel}
              onChange={(option) =>
                setPlanLabel(option?.value ?? RENEWAL_PLAN_OPTIONS[0].label)
              }
            />
          </div>
          <div>
            <label className="f-label">Expiry Date</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              dateFormat="d M, yy"
              ariaLabel="Expiry date"
              value={expiry}
              onChange={(e) => setExpiry((e.value as Date) ?? null)}
            />
          </div>
          <div>
            <label className="f-label">Value ($)</label>
            <input
              type="number"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Stage</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Stage"
              options={STAGE_OPTIONS}
              value={stage}
              onChange={(option) =>
                setStage((option?.value as RenewalStage) ?? "Not Contacted")
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalEditModal;
