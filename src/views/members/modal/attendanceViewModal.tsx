import { History, Printer } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { AttendanceRecord } from "../../../types/attendance";
import { ATTENDANCE_STATUS_BADGE } from "../../../utils/json/attendanceData";

/*
   Attendance Details — ported from #modal-view-attendance in
   tailwind/src/attendance.html and showDetails() in
   assets/js/attendance.js.
*/

type AttendanceViewModalProps = {
  record: AttendanceRecord | null;
  onClose: () => void;
  onHistory: (record: AttendanceRecord) => void;
};

const AttendanceViewModal = ({ record, onClose, onHistory }: AttendanceViewModalProps) => (
  <Modal open={record !== null} onClose={onClose} title="Attendance Details" boxClassName="glass">
    <div className="gold-border-card p-5 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`av ${record?.avatar ?? "av-gold"} w-14! h-14! text-lg! rounded-2xl`}
        >
          {record?.initials ?? "AB"}
        </div>
        <div className="flex-1">
          <div className="text-lg font-black c-text">{record?.name ?? "—"}</div>
          <div className="text-[11px] c-dim">{record?.id ?? "—"}</div>
        </div>
        <span
          className={`badge ${record ? ATTENDANCE_STATUS_BADGE[record.status] : "badge-present"}`}
        >
          <span className="dot" />
          {record?.status ?? "Present"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 bd-t">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1">
            Date
          </div>
          <div className="text-sm font-semibold c-text">{record?.date ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1">
            Trainer
          </div>
          <div className="text-sm font-semibold c-text">{record?.trainer ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1">
            Check-In
          </div>
          <div className="text-sm font-semibold c-green">{record?.checkIn ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1">
            Check-Out
          </div>
          <div className="text-sm font-semibold c-orange">{record?.checkOut ?? "—"}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] font-black uppercase tracking-wider c-dim2 mb-1">
            Total Duration
          </div>
          <div className="text-lg font-black gt">{record?.hours ?? "—"}</div>
        </div>
      </div>
    </div>
    <div className="flex gap-3">
      <button
        type="button"
        className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => record && onHistory(record)}
      >
        <History className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        History
      </button>
      <button
        type="button"
        className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
        onClick={() => window.print()}
      >
        <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
        Print Slip
      </button>
    </div>
  </Modal>
);

export default AttendanceViewModal;
