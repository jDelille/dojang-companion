import { useState } from "react";
import { Truck, X } from "lucide-react";
import type { InventoryItem, TransferValues } from "../../../types/inventory";
import { LOCATIONS } from "../../../utils/json/inventoryData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Transfer Stock — ported from #modal-transfer in tailwind/src/inventory.html
   and openTransfer()/confirmTransfer() in assets/js/inventory.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type InventoryTransferModalProps = {
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (id: number, values: TransferValues) => boolean;
};

const InventoryTransferModal = ({ item, onClose, onConfirm }: InventoryTransferModalProps) => {
  const open = item !== null;
  const [to, setTo] = useState(LOCATIONS[0]);
  const [qty, setQty] = useState("");

  const confirm = () => {
    if (!item) return;
    const accepted = onConfirm(item.id, { to, qty: Number(qty) || 0 });
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Transfer Stock</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {item ? item.name + " · " + item.onHand + " on hand" : "Item"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">From</label>
            <input type="text" className="fp-input py-2.5 text-sm" value="Austin HQ" readOnly />
          </div>
          <div>
            <label className="f-label">To location</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="To location"
              options={toOptions(LOCATIONS)}
              value={to}
              onChange={(option) => setTo(option?.value ?? LOCATIONS[0])}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="f-label">Quantity to transfer</label>
          <input
            type="number"
            min="1"
            className="fp-input py-2.5 text-sm"
            placeholder="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={confirm}
          >
            <Truck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTransferModal;
