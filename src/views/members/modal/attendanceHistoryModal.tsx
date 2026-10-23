import Modal from "../../../components/common/Modal";
import type { AttendanceRecord } from "../../../types/attendance";
import { ATTENDANCE_STATUS_BADGE } from "../../../utils/json/attendanceData";
import type { HistoryResult } from "../useAttendance";

/*
   Attendance History — ported from #modal-history in
   tailwind/src/attendance.html and openHistory() in
   assets/js/attendance.js.
*/

type AttendanceHistoryModalProps = {
  record: AttendanceRecord | null;
  history: HistoryResult | null;
  onClose: () => void;
};

const AttendanceHistoryModal = ({
  record,
  history,
  onClose,
}: AttendanceHistoryModalProps) => (
  <Modal
    open={record !== null}
    onClose={onClose}
    title="Attendance History"
    boxClassName="glass modal-w-420"
    headerClassName="mb-4"
  >
    <div className="gold-border-card p-3 mb-4 flex items-center gap-3">
      <div className={`av ${record?.avatar ?? "av-gold"} w-11! h-11! rounded-xl`}>
        {record?.initials ?? "--"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold c-text">{record?.name ?? "—"}</div>
        <div className="text-[11px] c-dim">
          {record ? `${record.id} · ${record.plan}` : "—"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-black gt">{history ? `${history.rate}%` : "—"}</div>
        <div className="text-[10px] c-dim2">30-day rate</div>
      </div>
    </div>
    <div className="flex flex-col gap-2 hist-scroll">
      {history?.rows.map((row) => (
        <div key={row.day} className="hist-row">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold c-text">{row.day}</div>
            <div className="text-[11px] c-dim">Check-in {row.checkIn}</div>
          </div>
          <span className={`badge ${ATTENDANCE_STATUS_BADGE[row.status]}`}>
            <span className="dot" />
            {row.status}
          </span>
        </div>
      ))}
    </div>
  </Modal>
);

export default AttendanceHistoryModal;
