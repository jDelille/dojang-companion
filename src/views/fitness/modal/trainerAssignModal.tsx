import { useState } from "react";
import { X } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { CLASS_POOL } from "../../../utils/json/trainersData";
import { fullName } from "../useTrainers";

/*
   Assign Classes — ported from #modal-assign in tailwind/src/trainers.html and
   openAssign()/confirmAssign() in assets/js/trainers.js.

   Remounted with key={trainer?.id} by the parent so the checkbox set reseeds
   from the trainer's current assignments.
*/

type TrainerAssignModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  onConfirm: (id: number, classes: string[]) => void;
};

const TrainerAssignModal = ({ trainer, onClose, onConfirm }: TrainerAssignModalProps) => {
  const open = trainer !== null;
  const [selected, setSelected] = useState<string[]>(trainer?.classes ?? []);

  const toggle = (name: string, checked: boolean) =>
    setSelected((prev) =>
      checked ? [...prev, name] : prev.filter((entry) => entry !== name),
    );

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black c-text text-lg">Assign Classes</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {trainer ? fullName(trainer) + " · " + trainer.spec : "Trainer"}
        </div>
        <div className="mb-2">
          {CLASS_POOL.map((entry) => (
            <label key={entry.name} className="assign-item">
              <input
                type="checkbox"
                value={entry.name}
                checked={selected.includes(entry.name)}
                onChange={(e) => toggle(entry.name, e.target.checked)}
              />
              <div>
                <div className="ai-name">{entry.name}</div>
                <div className="ai-sub">{entry.slot}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!trainer) return;
              onConfirm(trainer.id, selected);
              onClose();
            }}
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerAssignModal;
