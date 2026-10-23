import { useState } from "react";
import PosModal from "../posModal";
import type { CartItem } from "../types";

/*
   Edit Item, ported from #modal-edit-item in tailwind/src/pos.html.

   The form is seeded from the cart line each time it opens, mirroring
   openEdit()'s three field assignments.
*/

type EditItemModalProps = {
  open: boolean;
  item: CartItem | undefined;
  onClose: () => void;
  onSave: (id: number, name: string, price: number, qty: number) => void;
  onInvalid: () => void;
};

const EditItemModal = ({
  open,
  item,
  onClose,
  onSave,
  onInvalid,
}: EditItemModalProps) => {
  /* Seeded once; the caller keys this modal per item so it remounts fresh. */
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [qty, setQty] = useState(item ? String(item.qty) : "");

  const submit = () => {
    if (!item) {
      onClose();
      return;
    }
    const p = parseFloat(price);
    const q = parseInt(qty, 10);
    if (!name.trim() || !(p >= 0) || !(q >= 1)) {
      onInvalid();
      return;
    }
    onSave(item.id, name.trim(), p, q);
    onClose();
  };

  return (
    <PosModal open={open} onClose={onClose} title="Edit Item">
      <div className="field">
        <label className="field-label">Item Name</label>
        <input
          type="text"
          className="fp-input py-2.5 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label className="field-label">Price ($)</label>
          <input
            type="number"
            className="fp-input py-2.5 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Quantity</label>
          <input
            type="number"
            min={1}
            className="fp-input py-2.5 text-sm"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
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
          onClick={submit}
        >
          Save Changes
        </button>
      </div>
    </PosModal>
  );
};

export default EditItemModal;
