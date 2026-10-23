import { useState } from "react";
import { FilePlus, X } from "lucide-react";
import type { Supplier } from "../../../types/suppliers";
import { SUPPLIER_CATS } from "../../../utils/json/suppliersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";

/*
   New Purchase Order — ported from #modal-po in tailwind/src/suppliers.html and
   openPO()/confirmPO() in assets/js/suppliers.js. The PO reference is read-only
   and seeded from the running sequence; the flatpickr expected-date input
   (d M, Y) becomes CommonDatePicker with the same 2026-07-25 default.
*/

const CAT_OPTIONS = SUPPLIER_CATS.map((value) => ({ value, label: value }));

type SupplierPoModalProps = {
  supplier: Supplier | null;
  poSeq: number;
  onClose: () => void;
  onConfirm: (id: number, qty: number, price: number) => boolean;
};

const SupplierPoModal = ({ supplier, poSeq, onClose, onConfirm }: SupplierPoModalProps) => {
  const open = supplier !== null;
  const [category, setCategory] = useState(supplier?.category ?? SUPPLIER_CATS[0]);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState<Date | null>(new Date(2026, 6, 25));

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">New Purchase Order</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {supplier ? `${supplier.name} · ${supplier.category}` : "Supplier"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">PO Reference</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              readOnly
              value={"PO-" + poSeq}
            />
          </div>
          <div>
            <label className="f-label">Category</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Category"
              options={CAT_OPTIONS}
              value={category}
              onChange={(option) =>
                setCategory((option?.value as Supplier["category"]) ?? SUPPLIER_CATS[0])
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="f-label">Quantity</label>
            <input
              type="number"
              min="1"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
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
          <div>
            <label className="f-label">Expected</label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Expected"
              dateFormat="d M, yy"
              value={date}
              onChange={(e) => setDate((e.value as Date | null) ?? null)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!supplier) return;
              if (onConfirm(supplier.id, Number(qty) || 0, Number(price) || 0)) onClose();
            }}
          >
            <FilePlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Create PO
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierPoModal;
