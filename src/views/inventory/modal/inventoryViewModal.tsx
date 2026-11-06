import { Pencil, SlidersHorizontal, Truck, X } from "lucide-react";
import type { InventoryItem } from "../../../types/inventory";
import { LVL_META } from "../../../utils/json/inventoryData";
import { moneyWhole } from "../../../utils/formatUtils";
import { CAT_FALLBACK, INVENTORY_CAT_ICON } from "../inventoryIcons";
import { levelOf } from "../useInventory";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Item Details — ported from #modal-view in tailwind/src/inventory.html and
   openView() in assets/js/inventory.js.
*/

type InventoryViewModalProps = {
  item: InventoryItem | null;
  onClose: () => void;
  onTransfer: () => void;
  onAdjust: () => void;
  onEdit: () => void;
};

const InventoryViewModal = ({
  item,
  onClose,
  onTransfer,
  onAdjust,
  onEdit,
}: InventoryViewModalProps) => {
  const open = item !== null;
  const level = item ? levelOf(item) : "Healthy";
  const Icon = item ? INVENTORY_CAT_ICON[item.category] ?? CAT_FALLBACK : CAT_FALLBACK;

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
            <h3 className="text-base font-black c-text">Item Details</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div className="inv-ic size-px-44">
            <Icon
              className="shrink-0"
              style={{ width: "24px", height: "24px", color: "#D4AF37" }}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">{item?.name ?? "Item"}</div>
            <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
              {item?.category ?? "Category"}
            </div>
          </div>
          <span className={`badge ${LVL_META[level].badge}`}>{level}</span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">SKU</span>
            <span className="v font-mono">{item?.sku ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Unit price</span>
            <span className="v gt">{item ? moneyWhole(item.price) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">On hand</span>
            <span className="v">{item ? item.onHand + " units" : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Reorder at</span>
            <span className="v">{item ? item.reorder + " units" : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Incoming</span>
            <span className="v">{item ? item.incoming + " units" : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Stock value</span>
            <span className="v">{item ? moneyWhole(item.price * item.onHand) : "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onTransfer}
          >
            <Truck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Transfer
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onAdjust}
          >
            <SlidersHorizontal className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Adjust
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryViewModal;
