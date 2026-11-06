import { Wrench, X } from "lucide-react";
import type { Equipment } from "../../../types/equipment";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Service History — ported from #modal-history in tailwind/src/equipment.html and
   openHistory() in assets/js/equipment.js.
*/

type EquipmentHistoryModalProps = {
  equipment: Equipment | null;
  onClose: () => void;
  onLogMaintenance: () => void;
};

const EquipmentHistoryModal = ({
  equipment,
  onClose,
  onLogMaintenance,
}: EquipmentHistoryModalProps) => {
  const open = equipment !== null;
  const history = equipment?.history ?? [];

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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {equipment ? "Service History · " + equipment.name : "Service History"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="svc-scroll mb-5">
          {history.length === 0 && (
            <div className="text-xs c-dim text-center py-6">No service records yet</div>
          )}
          {history.map((h, index) => (
            <div key={`${h.date}-${h.action}-${index}`} className="svc-item">
              <div className="svc-dot">
                <Wrench className="w-[14px] h-[14px] c-gold shrink-0" aria-hidden="true" />
              </div>
              <div className="svc-body">
                <div className="svc-action">{h.action}</div>
                <div className="svc-meta">
                  {h.date} · {h.note}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onLogMaintenance}
          >
            <Wrench className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Log Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentHistoryModal;
