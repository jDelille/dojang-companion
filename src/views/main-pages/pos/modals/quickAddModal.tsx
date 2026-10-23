import { useState } from "react";
import PosModal from "../posModal";

/*
   Add Custom Item, ported from #modal-quick-add in tailwind/src/pos.html.

   Field errors use the template's .field / .has-error / .field-err pattern
   rather than native validation, so the styling already in style.css applies.
*/

type QuickAddModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number) => void;
};

const QuickAddModal = ({ open, onClose, onAdd }: QuickAddModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [touched, setTouched] = useState(false);

  const priceNum = parseFloat(price);
  const nameBad = touched && !name.trim();
  const priceBad = touched && !(priceNum > 0);

  const submit = () => {
    setTouched(true);
    if (!name.trim() || !(priceNum > 0)) return;
    onAdd(name.trim(), priceNum);
    onClose();
  };

  return (
    <PosModal open={open} onClose={onClose} title="Add Custom Item">
      <div className={nameBad ? "field has-error" : "field"}>
        <label className="field-label">Item Name</label>
        <input
          type="text"
          className="fp-input py-2.5 text-sm"
          placeholder="e.g. Day Pass"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="field-err">Enter an item name.</div>
      </div>
      <div className={priceBad ? "field has-error" : "field"}>
        <label className="field-label">Price ($)</label>
        <input
          type="number"
          className="fp-input py-2.5 text-sm"
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <div className="field-err">Enter a valid price.</div>
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
          Add to Cart
        </button>
      </div>
    </PosModal>
  );
};

export default QuickAddModal;
