import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  Equipment,
  EquipmentCategory,
  EquipmentFormValues,
  EquipmentStatus,
} from "../../../types/equipment";
import {
  EQ_CATS,
  EQ_LOCATIONS,
  EQ_STATUSES,
} from "../../../utils/json/equipmentData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Equipment — ported from #modal-equipment-form in
   tailwind/src/equipment.html and openForm()/submitForm() in
   assets/js/equipment.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type EquipmentFormModalProps = {
  open: boolean;
  target: Equipment | null;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues, editId: number | null) => boolean;
};

const EquipmentFormModal = ({
  open,
  target,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [category, setCategory] = useState<EquipmentCategory>(
    target?.category ?? EQ_CATS[0],
  );
  const [asset, setAsset] = useState(target?.asset ?? "");
  const [qty, setQty] = useState(String(target?.qty ?? 1));
  const [condition, setCondition] = useState(String(target?.condition ?? 100));
  const [location, setLocation] = useState(target?.location ?? EQ_LOCATIONS[0]);
  const [status, setStatus] = useState<EquipmentStatus>(target?.status ?? EQ_STATUSES[0]);

  const submit = () => {
    const accepted = onSubmit(
      {
        name,
        category,
        asset,
        qty: Number(qty) || 1,
        condition: Number(condition) || 0,
        location,
        status,
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {target ? "Edit Equipment" : "Add Equipment"}
            </h3>
          </div>
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
          <div>
            <label className="f-label">Equipment name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Treadmill Pro X9"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Category</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Category"
                options={toOptions(EQ_CATS)}
                value={category}
                onChange={(option) =>
                  setCategory((option?.value as EquipmentCategory) ?? EQ_CATS[0])
                }
              />
            </div>
            <div>
              <label className="f-label">Asset ID</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="EQ-000"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="fp-input py-2.5 text-sm"
                placeholder="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Condition (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="fp-input py-2.5 text-sm"
                placeholder="100"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Location</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Location"
                options={toOptions(EQ_LOCATIONS)}
                value={location}
                onChange={(option) => setLocation(option?.value ?? EQ_LOCATIONS[0])}
              />
            </div>
            <div>
              <label className="f-label">Status</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Status"
                options={toOptions(EQ_STATUSES)}
                value={status}
                onChange={(option) =>
                  setStatus((option?.value as EquipmentStatus) ?? EQ_STATUSES[0])
                }
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
              {target ? "Save Changes" : "Save Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentFormModal;
