import { X } from "lucide-react";
import type { AttendanceStatus, Trainer } from "../../../types/trainers";
import { attendanceFor, fullName } from "../useTrainers";

/*
   Attendance — ported from #modal-attendance in tailwind/src/trainers.html and
   openAttendance() in assets/js/trainers.js. Read-only: the week sample is
   derived from the trainer, and the only button closes the modal.
*/

const BADGE: Record<AttendanceStatus, string> = {
  present: "badge-present",
  late: "badge-late",
  absent: "badge-absent",
};

const LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
};

type TrainerAttendanceModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
};

const TrainerAttendanceModal = ({ trainer, onClose }: TrainerAttendanceModalProps) => {
  const open = trainer !== null;
  const rows = trainer ? attendanceFor(trainer) : [];
  const present = rows.filter((row) => row.s !== "absent").length;

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
          <h3 className="font-black c-text text-lg">Attendance</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-1">{trainer ? fullName(trainer) : "Trainer"}</div>
        <p className="text-xs c-dim mb-3">
          {rows.length ? `${present}/${rows.length} days present this week` : "—"}
        </p>
        <div>
          {rows.map((row) => (
            <div key={row.d} className="att-row">
              <span className="att-date">{row.d}</span>
              <span className={`badge ${BADGE[row.s]}`}>
                <span className="dot" />
                {LABEL[row.s]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerAttendanceModal;
