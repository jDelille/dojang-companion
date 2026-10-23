import { useState } from "react";
import { X } from "lucide-react";
import type { AdjustmentValues, InventoryItem } from "../../../types/inventory";
import { ADJUST_REASONS, ADJUST_TYPES } from "../../../utils/json/inventoryData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Stock Adjustment — ported from #modal-adjust in tailwind/src/inventory.html
   and openAdjust()/confirmAdjust() in assets/js/inventory.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type InventoryAdjustModalProps = {
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (id: number, values: AdjustmentValues) => boolean;
};

const InventoryAdjustModal = ({ item, onClose, onConfirm }: InventoryAdjustModalProps) => {
  const open = item !== null;
  const [type, setType] = useState(ADJUST_TYPES[0]);
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState(ADJUST_REASONS[0]);

  const confirm = () => {
    if (!item) return;
    const accepted = onConfirm(item.id, { type, qty: Number(qty) || 0, reason });
    if (accepted) onClose();
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
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Stock Adjustment</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-3">{item ? item.name + " · " + item.sku : "Item"}</div>
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="c-dim">Current on hand</span>
          <span className="font-bold c-text">
            <span>{item?.onHand ?? 0}</span> units
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="f-label">Adjustment</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Adjustment"
              options={toOptions(ADJUST_TYPES)}
              value={type}
              onChange={(option) => setType(option?.value ?? ADJUST_TYPES[0])}
            />
          </div>
          <div>
            <label className="f-label">Quantity</label>
            <input
              type="number"
              min="0"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>
        <label className="f-label">Reason</label>
        <CommonSelect
          fieldClassName="py-2.5 text-sm mb-1"
          ariaLabel="Reason"
          options={toOptions(ADJUST_REASONS)}
          value={reason}
          onChange={(option) => setReason(option?.value ?? ADJUST_REASONS[0])}
        />
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={confirm}>
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjustModal;
