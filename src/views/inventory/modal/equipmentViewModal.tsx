import { ClipboardList, Pencil, Wrench, X } from "lucide-react";
import type { Equipment } from "../../../types/equipment";
import { EQ_STATUS_BADGE } from "../../../utils/json/equipmentData";
import { EQ_CAT_ICON, EQ_ICON_FALLBACK } from "../equipmentIcons";
import { condColor } from "../useEquipment";

/*
   Equipment Details — ported from #modal-view in tailwind/src/equipment.html and
   openView() in assets/js/equipment.js.
*/

type EquipmentViewModalProps = {
  equipment: Equipment | null;
  onClose: () => void;
  onHistory: () => void;
  onService: () => void;
  onEdit: () => void;
};

const EquipmentViewModal = ({
  equipment,
  onClose,
  onHistory,
  onService,
  onEdit,
}: EquipmentViewModalProps) => {
  const open = equipment !== null;
  const Icon = equipment ? (EQ_CAT_ICON[equipment.category] ?? EQ_ICON_FALLBACK) : null;

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
          <h3 className="text-base font-black c-text">Equipment Details</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div className="eq-ic size-px-44">
            {Icon && (
              <Icon
                style={{ width: "24px", height: "24px", color: "#D4AF37" }}
                className="shrink-0"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">
              {equipment?.name ?? "Equipment"}
            </div>
            <div className="text-[11px] c-gold font-semibold uppercase tracking-wider">
              {equipment?.category ?? "Category"}
            </div>
          </div>
          <span
            className={`badge ${equipment ? EQ_STATUS_BADGE[equipment.status] : "badge-present"}`}
          >
            <span className="dot" />
            {equipment?.status ?? "Operational"}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Asset ID</span>
            <span className="v font-mono">{equipment?.asset ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Quantity</span>
            <span className="v">{equipment ? `${equipment.qty} units` : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Location</span>
            <span className="v">{equipment?.location ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Condition</span>
            <span
              className="v"
              style={{ color: equipment ? condColor(equipment.condition) : undefined }}
            >
              {equipment ? `${equipment.condition}%` : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Last service</span>
            <span className="v">{equipment?.lastService ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Next service</span>
            <span className="v">{equipment?.nextService ?? "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onHistory}
          >
            <ClipboardList className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            History
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onService}
          >
            <Wrench className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Service
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

export default EquipmentViewModal;
