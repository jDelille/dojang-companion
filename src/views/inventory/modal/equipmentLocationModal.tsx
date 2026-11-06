import { useState } from "react";
import { MapPin, X } from "lucide-react";
import type { Equipment } from "../../../types/equipment";
import { EQ_LOCATIONS } from "../../../utils/json/equipmentData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Location — ported from #modal-location in tailwind/src/equipment.html
   and openLocation()/confirmLocation() in assets/js/equipment.js.
*/

const LOCATION_OPTIONS = EQ_LOCATIONS.map((value) => ({ value, label: value }));

type EquipmentLocationModalProps = {
  equipment: Equipment | null;
  onClose: () => void;
  onConfirm: (id: number, location: string) => void;
};

const EquipmentLocationModal = ({
  equipment,
  onClose,
  onConfirm,
}: EquipmentLocationModalProps) => {
  const open = equipment !== null;
  const [location, setLocation] = useState(equipment?.location ?? EQ_LOCATIONS[0]);

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
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Assign Location</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {equipment ? `${equipment.name} · currently ${equipment.location}` : "Equipment"}
        </div>
        <div>
          <label className="f-label">Move to</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Move to"
            options={LOCATION_OPTIONS}
            value={location}
            onChange={(option) => setLocation(option?.value ?? EQ_LOCATIONS[0])}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!equipment) return;
              onConfirm(equipment.id, location);
              onClose();
            }}
          >
            <MapPin className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentLocationModal;
