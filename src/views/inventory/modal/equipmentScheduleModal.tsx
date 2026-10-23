import { Download, X } from "lucide-react";
import type { Equipment } from "../../../types/equipment";
import { EQ_STATUS_BADGE } from "../../../utils/json/equipmentData";
import { EQ_CAT_ICON, EQ_ICON_FALLBACK } from "../equipmentIcons";

/*
   Maintenance Schedule — ported from #modal-schedule in tailwind/src/equipment.html
   and openSchedule() in assets/js/equipment.js. Assets needing attention are
   listed first, then the operational ones.
*/

type EquipmentScheduleModalProps = {
  open: boolean;
  schedule: Equipment[];
  onClose: () => void;
  onService: (id: number) => void;
  onExport: () => void;
};

const EquipmentScheduleModal = ({
  open,
  schedule,
  onClose,
  onService,
  onExport,
}: EquipmentScheduleModalProps) => (
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
        <h3 className="text-base font-black c-text">Maintenance Schedule</h3>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="svc-scroll mb-5">
        {schedule.map((e) => {
          const Icon = EQ_CAT_ICON[e.category] ?? EQ_ICON_FALLBACK;
          return (
            <div key={e.id} className="sch-row">
              <div className="eq-rowic">
                <Icon className="w-[15px] h-[15px] c-gold shrink-0" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold c-text truncate">{e.name}</div>
                <div className="text-[11px] c-dim">
                  {e.asset} · next service {e.nextService}
                </div>
              </div>
              <span className={`badge ${EQ_STATUS_BADGE[e.status]}`}>{e.status}</span>
              <button
                type="button"
                className="btn-ghost px-2.5 py-1 text-[11px]"
                onClick={() => onService(e.id)}
              >
                Service
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onExport}
        >
          <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Export Schedule
        </button>
      </div>
    </div>
  </div>
);

export default EquipmentScheduleModal;
