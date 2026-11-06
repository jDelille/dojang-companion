import { useState } from "react";
import { X } from "lucide-react";
import type { Equipment, MaintenanceValues } from "../../../types/equipment";
import { MAINTENANCE_TYPES } from "../../../utils/json/equipmentData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Log Maintenance — ported from #modal-maintenance in tailwind/src/equipment.html
   and openMaintenance()/confirmMaintenance() in assets/js/equipment.js.

   The template's flatpickr "next service date" input (d M, Y) becomes
   CommonDatePicker; leaving it empty keeps the asset's existing next-service date.
*/

const TYPE_OPTIONS = MAINTENANCE_TYPES.map((value) => ({ value, label: value }));

type EquipmentMaintenanceModalProps = {
  equipment: Equipment | null;
  onClose: () => void;
  onConfirm: (id: number, values: MaintenanceValues) => void;
};

const EquipmentMaintenanceModal = ({
  equipment,
  onClose,
  onConfirm,
}: EquipmentMaintenanceModalProps) => {
  const open = equipment !== null;
  const [type, setType] = useState(MAINTENANCE_TYPES[0]);
  const [condition, setCondition] = useState(String(equipment?.condition ?? 0));
  const [next, setNext] = useState<Date | null>(null);
  const [note, setNote] = useState("");

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
            <h3 className="text-base font-black c-text">Log Maintenance</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-3">
          {equipment ? `${equipment.name} · ${equipment.asset}` : "Equipment"}
        </div>
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="c-dim">Current</span>
          <span className="font-bold c-text">
            {equipment ? `${equipment.condition}% · ${equipment.status}` : "—"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="f-label">Action</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Action"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(option) => setType(option?.value ?? MAINTENANCE_TYPES[0])}
            />
          </div>
          <div>
            <label className="f-label">Condition (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="fp-input py-2.5 text-sm"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="f-label">Next service date</label>
          <CommonDatePicker
            className="py-2.5 text-sm"
            ariaLabel="Next service date"
            dateFormat="d M, yy"
            value={next}
            onChange={(e) => setNext((e.value as Date | null) ?? null)}
          />
        </div>
        <div>
          <label className="f-label">Notes</label>
          <textarea
            className="fp-input py-2.5 text-sm"
            rows={2}
            placeholder="What was done…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!equipment) return;
              onConfirm(equipment.id, {
                type,
                condition: Number(condition) || equipment.condition,
                next,
                note,
              });
              onClose();
            }}
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentMaintenanceModal;
