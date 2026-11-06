import { useState } from "react";
import { AlertCircle, Wrench, X } from "lucide-react";
import type { Locker, MaintenanceErrors, MaintenanceValues } from "../../../types/lockers";
import { ISSUES, TECHS, TODAY } from "../../../utils/json/lockersData";
import CommonSelect from "../../../components/common-select/commonSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import { addDays, code, parseIso, toIso } from "../useLockers";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Locker Maintenance — ported from #modal-maintenance in tailwind/src/lockers.html
   and openMaintenance()/validateMaintenance()/submitMaintenance() in
   assets/js/lockers.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));
const TODAY_ISO = TODAY;

type LockerMaintenanceModalProps = {
  targets: Locker[];
  onClose: () => void;
  onConfirm: (ids: number[], values: MaintenanceValues) => void;
};

const LockerMaintenanceModal = ({ targets, onClose, onConfirm }: LockerMaintenanceModalProps) => {
  const open = targets.length > 0;
  const [type, setType] = useState(ISSUES[0]);
  const [tech, setTech] = useState(TECHS[0]);
  const [due, setDue] = useState<Date | null>(parseIso(addDays(TODAY, 3), new Date()));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<MaintenanceErrors>({});

  const context =
    targets.length === 1
      ? "Locker " + targets[0].num + " · " + code(targets[0]) + " · " + targets[0].zone + " Zone"
      : targets.length + " lockers: " + targets.map((l) => l.num).join(", ");
  const current = targets.length === 1 ? targets[0]?.status : "Mixed (" + targets.length + " lockers)";

  const validate = (): boolean => {
    const next: MaintenanceErrors = {};
    const dueIso = due ? toIso(due) : "";
    if (!dueIso) next.due = "Pick an expected completion date";
    else if (dueIso < TODAY_ISO) next.due = "Completion date cannot be in the past";

    const trimmed = note.trim();
    if (trimmed.length > 0 && trimmed.length < 4) next.note = "Add a little more detail";

    setErrors(next);
    return !next.due && !next.note;
  };

  const submit = () => {
    if (!validate()) return;
    onConfirm(
      targets.map((l) => l.id),
      { type, tech, due, note },
    );
    onClose();
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mt-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="mt-title" className="text-base font-black c-text">
              Locker Maintenance
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-3">{context}</div>
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="c-dim">Current status</span>
          <span className="font-bold c-text">{current ?? "—"}</span>
        </div>
        <form
          className="space-y-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label" htmlFor="mt-type">
                Issue
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Issue"
                options={toOptions(ISSUES)}
                value={type}
                onChange={(o) => setType(o?.value ?? ISSUES[0])}
              />
            </div>
            <div>
              <label className="f-label" htmlFor="mt-tech">
                Technician
              </label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Technician"
                options={toOptions(TECHS)}
                value={tech}
                onChange={(o) => setTech(o?.value ?? TECHS[0])}
              />
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="mt-due">
              Expected completion
            </label>
            <CommonDatePicker
              className="py-2.5 text-sm"
              ariaLabel="Expected completion"
              dateFormat="d M, yy"
              value={due}
              onChange={(e) => setDue((e.value as Date | null) ?? null)}
            />
            <div className={`f-error${errors.due ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.due ?? ""}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="mt-note">
              Notes
            </label>
            <textarea
              id="mt-note"
              className="fp-input py-2.5 text-sm"
              rows={2}
              placeholder="Describe the fault…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className={`f-error${errors.note ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{errors.note ?? ""}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Wrench className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Log Maintenance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockerMaintenanceModal;
