import { useState } from "react";
import { X } from "lucide-react";
import type { Trainer, TrainerFormValues, TrainerLevel } from "../../../types/trainers";
import { LEVELS, SPECS } from "../../../utils/json/trainersData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Trainer — ported from #modal-trainer-form in tailwind/src/trainers.html
   and openForm()/submitForm() in assets/js/trainers.js.

   The parent remounts this with key={target?.id ?? "new"} so switching records
   reseeds the form without a setState-in-effect.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type TrainerFormModalProps = {
  open: boolean;
  /** null → "Add New Trainer"; a trainer → "Edit Trainer". */
  target: Trainer | null;
  onClose: () => void;
  /** Returns true when the values were accepted, so the modal can close. */
  onSubmit: (values: TrainerFormValues, editId: number | null) => boolean;
};

const TrainerFormModal = ({ open, target, onClose, onSubmit }: TrainerFormModalProps) => {
  const [first, setFirst] = useState(target?.first ?? "");
  const [last, setLast] = useState(target?.last ?? "");
  const [phone, setPhone] = useState(target?.phone ?? "");
  const [email, setEmail] = useState(target?.email ?? "");
  const [spec, setSpec] = useState(target?.spec ?? SPECS[0]);
  const [level, setLevel] = useState<TrainerLevel>(target?.level ?? LEVELS[1]);
  const [commission, setCommission] = useState(target ? String(target.commission) : "");

  const submit = () => {
    const accepted = onSubmit(
      { first, last, phone, email, spec, level, commission: Number(commission) || 0 },
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
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h3 id="tf-title" className="font-black c-text text-lg">
            {target ? "Edit Trainer" : "Add New Trainer"}
          </h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">First Name</label>
            <input
              type="text"
              className="fp-input"
              placeholder="Daniel"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Last Name</label>
            <input
              type="text"
              className="fp-input"
              placeholder="Foster"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Phone</label>
            <input
              type="text"
              className="fp-input"
              placeholder="(512) 555-0142"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Email</label>
            <input
              type="text"
              className="fp-input"
              placeholder="daniel@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Specialization</label>
            <CommonSelect
              ariaLabel="Specialization"
              options={toOptions(SPECS)}
              value={spec}
              onChange={(option) => setSpec(option?.value ?? SPECS[0])}
            />
          </div>
          <div>
            <label className="f-label">Level</label>
            <CommonSelect
              ariaLabel="Level"
              options={toOptions(LEVELS)}
              value={level}
              onChange={(option) => setLevel((option?.value as TrainerLevel) ?? LEVELS[1])}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Monthly Commission ($)</label>
            <input
              type="number"
              className="fp-input"
              placeholder="30000"
              min="0"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={submit}>
            {target ? "Save Changes" : "Add Trainer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerFormModal;
