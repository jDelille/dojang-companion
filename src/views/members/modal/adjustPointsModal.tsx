import { useEffect, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { LoyaltyMember } from "../../../types/rewards";
import { number } from "../../../utils/formatUtils";

/*
   Adjust Points — ported from #modal-adjust in tailwind/src/rewards.html and
   openAdjust()/adjustDelta()/updateAdjustPreview()/confirmAdjust() in
   assets/js/rewards.js.

   The preview recalculates as member, direction or amount change, and the
   balance is floored at zero.
*/

const DIRECTION_OPTIONS = [
  { value: "add", label: "Add (+)" },
  { value: "deduct", label: "Deduct (−)" },
];

type AdjustPointsModalProps = {
  open: boolean;
  members: LoyaltyMember[];
  onClose: () => void;
  onAdjust: (member: LoyaltyMember, delta: number) => void;
};

const AdjustPointsModal = ({
  open,
  members,
  onClose,
  onAdjust,
}: AdjustPointsModalProps) => {
  const [name, setName] = useState(members[0]?.name ?? "");
  const [direction, setDirection] = useState("add");
  const [amount, setAmount] = useState("50");
  const [note, setNote] = useState("");

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

  const member = members.find((item) => item.name === name);
  const delta = (Number(amount) || 0) * (direction === "deduct" ? -1 : 1);
  const preview = Math.max(0, (member?.pts ?? 0) + delta);

  const memberOptions = members.map((item) => ({
    value: item.name,
    label: `${item.name} (${number(item.pts)} pts)`,
  }));

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
              <SlidersHorizontal
                className="w-[17px] h-[17px] c-gold shrink-0"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-base font-black c-text">Adjust Points</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={memberOptions}
              value={name}
              onChange={(option) => setName(option?.value ?? members[0]?.name ?? "")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Direction</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Direction"
                options={DIRECTION_OPTIONS}
                value={direction}
                onChange={(option) => setDirection(option?.value ?? "add")}
              />
            </div>
            <div>
              <label className="f-label">Amount</label>
              <input
                type="number"
                className="fp-input py-2.5 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="f-label">Note</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Correction / goodwill"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="amount-box mt-4">
          <span className="text-xs c-dim font-semibold">New balance</span>
          <span className="text-lg font-black gt">{number(preview)} pts</span>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => member && onAdjust(member, delta)}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustPointsModal;
