import { DollarSign, FilePlus, Send, X } from "lucide-react";
import type { Supplier } from "../../../types/suppliers";
import { SUPPLIER_STATUS_BADGE } from "../../../utils/json/suppliersData";
import { initials, moneyWhole } from "../../../utils/formatUtils";
import SupplierStars from "../supplierStars";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Supplier Details — ported from #modal-view in tailwind/src/suppliers.html and
   openView() in assets/js/suppliers.js.
*/

type SupplierViewModalProps = {
  supplier: Supplier | null;
  onClose: () => void;
  onContact: () => void;
  onPay: () => void;
  onPO: () => void;
};

const SupplierViewModal = ({
  supplier,
  onClose,
  onContact,
  onPay,
  onPO,
}: SupplierViewModalProps) => {
  const open = supplier !== null;

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
            <h3 className="text-base font-black c-text">Supplier Details</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="sup-view-head">
          <div className="sup-logo">{supplier ? initials(supplier.name) : "AN"}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">
              {supplier?.name ?? "Supplier"}
            </div>
            <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
              {supplier?.category ?? "Category"}
            </div>
            {supplier && <SupplierStars rating={supplier.rating} className="mt-1" />}
          </div>
          <span
            className={`badge ${supplier ? SUPPLIER_STATUS_BADGE[supplier.status] : "badge-present"}`}
          >
            <span className="dot" />
            {supplier?.status ?? "Active"}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Contact person</span>
            <span className="v">{supplier?.contact ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Email</span>
            <span className="v">{supplier?.email ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Phone</span>
            <span className="v">{supplier?.phone ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">City</span>
            <span className="v">{supplier?.city ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Open POs</span>
            <span className="v">{supplier?.openPOs ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Spend (YTD)</span>
            <span className="v gt">{supplier ? moneyWhole(supplier.spend) : "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onContact}
          >
            <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Contact
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPay}
          >
            <DollarSign className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Pay
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPO}
          >
            <FilePlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            New PO
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierViewModal;
