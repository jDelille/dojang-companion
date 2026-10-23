import { useEffect, useState } from "react";
import { Edit2, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { CheckinLogEntry, LogStatus } from "../../../types/checkin";
import {
  EDIT_TRAINER_OPTIONS,
  LOG_STATUS_OPTIONS,
} from "../../../utils/json/checkinData";
import type { EditEntryInput } from "../useCheckin";

/*
   Edit Entry — ported from #modal-edit in tailwind/src/checkin.html and
   openEdit()/editSave() in assets/js/checkin.js.

   Seeded from the entry on mount; the page keys this by entry id. Raw markup
   because the header carries a gold icon tile.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type CheckinEditModalProps = {
  entry: CheckinLogEntry | null;
  onClose: () => void;
  onSave: (input: EditEntryInput) => void;
};

const CheckinEditModal = ({ entry, onClose, onSave }: CheckinEditModalProps) => {
  const open = entry !== null;
  const [status, setStatus] = useState<LogStatus>(entry?.status ?? "In Gym");
  const [trainer, setTrainer] = useState(
    entry && entry.trainer !== "—" ? entry.trainer : "Unassigned",
  );
  const [locker, setLocker] = useState(entry && entry.locker !== "—" ? entry.locker : "");
  const [time, setTime] = useState(entry?.time ?? "");
  const [notes, setNotes] = useState(entry && entry.notes !== "—" ? entry.notes : "");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <Edit2 className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Edit Entry</h3>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(LOG_STATUS_OPTIONS)}
              value={status}
              onChange={(option) => setStatus((option?.value as LogStatus) ?? "In Gym")}
            />
          </div>
          <div>
            <label className="f-label">Trainer</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Trainer"
              options={toOptions(EDIT_TRAINER_OPTIONS)}
              value={trainer}
              onChange={(option) => setTrainer(option?.value ?? "Unassigned")}
            />
          </div>
          <div>
            <label className="f-label">Locker</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={locker}
              onChange={(e) => setLocker(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Check-In Time</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Notes</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() =>
              entry && onSave({ id: entry.id, status, trainer, locker, time, notes })
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinEditModal;
