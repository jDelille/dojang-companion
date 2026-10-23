import { useState } from "react";
import PosModal from "../posModal";
import type { DiscountType } from "../types";

/*
   Apply Discount, ported from #modal-discount / applyDiscountFromModal() in
   tailwind/src/pos.html and assets/js/pos.js.

   This modal is a shortcut into the sidebar's discount panel: it sets the same
   type and value the panel owns rather than holding a discount of its own.
*/

const OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
  { value: "employee", label: "Employee (15%)" },
  { value: "promo", label: "Promo (10%)" },
  { value: "loyalty", label: "Loyalty Points" },
];

type DiscountModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (type: DiscountType, value: string) => void;
};

const DiscountModal = ({ open, onClose, onApply }: DiscountModalProps) => {
  const [type, setType] = useState<DiscountType>("percent");
  const [value, setValue] = useState("");

  return (
    <PosModal open={open} onClose={onClose} title="Apply Discount">
      <div className="field">
        <label className="field-label">Discount Type</label>
        <select
          className="fp-input py-2.5 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as DiscountType)}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">Value</label>
        <input
          type="number"
          className="fp-input py-2.5 text-sm"
          placeholder="e.g. 10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-ghost ripple flex-1 py-2.5 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold ripple flex-1 py-2.5 text-sm"
          onClick={() => {
            onApply(type, value);
            onClose();
          }}
        >
          Apply Discount
        </button>
      </div>
    </PosModal>
  );
};

export default DiscountModal;
