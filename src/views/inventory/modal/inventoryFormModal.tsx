import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  InventoryCategory,
  InventoryFormValues,
  InventoryItem,
} from "../../../types/inventory";
import { INVENTORY_CATS } from "../../../utils/json/inventoryData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Inventory Item — ported from #modal-item-form in
   tailwind/src/inventory.html and openForm()/submitForm() in
   assets/js/inventory.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type InventoryFormModalProps = {
  open: boolean;
  target: InventoryItem | null;
  onClose: () => void;
  onSubmit: (values: InventoryFormValues, editId: number | null) => boolean;
};

const InventoryFormModal = ({ open, target, onClose, onSubmit }: InventoryFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [sku, setSku] = useState(target?.sku ?? "");
  const [category, setCategory] = useState<InventoryCategory>(
    target?.category ?? INVENTORY_CATS[0],
  );
  const [price, setPrice] = useState(target ? String(target.price) : "");
  const [onHand, setOnHand] = useState(target ? String(target.onHand) : "0");
  const [reorder, setReorder] = useState(target ? String(target.reorder) : "10");

  const submit = () => {
    const accepted = onSubmit(
      {
        name,
        sku,
        category,
        price: Number(price) || 0,
        onHand: Number(onHand) || 0,
        reorder: Number(reorder) || 0,
      },
      target?.id ?? null,
    );
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
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">
            {target ? "Edit Inventory Item" : "Add Inventory Item"}
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Item name</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="e.g. Whey Protein 2 lb"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">SKU</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="SKU-000"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(INVENTORY_CATS)}
                value={category}
                onChange={(option) =>
                  setCategory((option?.value as InventoryCategory) ?? INVENTORY_CATS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">Unit price ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">On hand</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                value={onHand}
                onChange={(e) => setOnHand(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Reorder at</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="10"
                value={reorder}
                onChange={(e) => setReorder(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormModal;
