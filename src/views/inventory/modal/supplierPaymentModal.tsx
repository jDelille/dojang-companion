import { useState } from "react";
import { X } from "lucide-react";
import type { Supplier } from "../../../types/suppliers";
import { SUPPLIER_PAY_METHODS } from "../../../utils/json/suppliersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Record Payment — ported from #modal-payment in tailwind/src/suppliers.html and
   openPayment()/confirmPayment() in assets/js/suppliers.js. The "close one open
   PO" checkbox pre-checks when the vendor has open POs; the reference field is
   collected but unused, as in the template.
*/

const METHOD_OPTIONS = SUPPLIER_PAY_METHODS.map((value) => ({ value, label: value }));

type SupplierPaymentModalProps = {
  supplier: Supplier | null;
  onClose: () => void;
  onConfirm: (id: number, amount: number, method: string, closePO: boolean) => boolean;
};

const SupplierPaymentModal = ({
  supplier,
  onClose,
  onConfirm,
}: SupplierPaymentModalProps) => {
  const open = supplier !== null;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(SUPPLIER_PAY_METHODS[0]);
  const [reference, setReference] = useState("");
  const [closePO, setClosePO] = useState((supplier?.openPOs ?? 0) > 0);

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Record Payment</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {supplier
            ? `${supplier.name} · ${supplier.openPOs} open PO${supplier.openPOs === 1 ? "" : "s"}`
            : "Supplier"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Amount ($)</label>
            <input
              type="number"
              min="0"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Method</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Method"
              options={METHOD_OPTIONS}
              value={method}
              onChange={(option) => setMethod(option?.value ?? SUPPLIER_PAY_METHODS[0])}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="f-label">Reference / Invoice</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="INV / PO number"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm c-text2 cursor-pointer">
          <input
            type="checkbox"
            className="accent-gold instyle-51"
            checked={closePO}
            onChange={(e) => setClosePO(e.target.checked)}
          />
          Close one open purchase order
        </label>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!supplier) return;
              if (onConfirm(supplier.id, Number(amount) || 0, method, closePO)) onClose();
            }}
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierPaymentModal;
