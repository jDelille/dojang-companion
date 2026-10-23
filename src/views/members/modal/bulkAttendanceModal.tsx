import { useState } from "react";
import { CheckCheck, Save } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { AttendanceRecord } from "../../../types/attendance";
import { BULK_CODES, statusKey } from "../../../utils/json/attendanceData";
import type { BulkSelection } from "../useAttendance";

/*
   Bulk Attendance — ported from #modal-bulk in tailwind/src/attendance.html
   and openBulk()/renderBulk()/bulkSave() in assets/js/attendance.js.

   The draft seeds from each record's current status on mount, mirroring
   openBulk()'s `ATTENDANCE.forEach(r => bulkSel[r.id] = r.status)`. The page
   remounts this component each time it opens (key={open ...}) so the seed
   re-runs without an effect.
*/

type BulkAttendanceModalProps = {
  open: boolean;
  records: AttendanceRecord[];
  onClose: () => void;
  onSave: (selection: BulkSelection) => void;
};

const BulkAttendanceModal = ({
  open,
  records,
  onClose,
  onSave,
}: BulkAttendanceModalProps) => {
  const [selection, setSelection] = useState<BulkSelection>(() =>
    Object.fromEntries(records.map((record) => [record.id, record.status])),
  );

  const allPresent = () =>
    setSelection(Object.fromEntries(records.map((record) => [record.id, "Present"])));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Attendance"
      boxClassName="glass modal-w-560"
      headerClassName="mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] c-dim">
          Tap P / L / A / V to set each member&apos;s status for the day
        </span>
        <button
          type="button"
          className="btn-ghost px-3 py-1.5 text-[11px] flex items-center gap-1.5"
          onClick={allPresent}
        >
          <CheckCheck className="w-[12px] h-[12px] shrink-0" aria-hidden="true" />
          All Present
        </button>
      </div>
      <div className="flex flex-col gap-2 bulk-scroll">
        {records.map((record) => (
          <div key={record.id} className="bulk-row">
            <div className={`av ${record.avatar}`}>{record.initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold c-text truncate">{record.name}</div>
              <div className="text-[11px] c-dim">{record.plan}</div>
            </div>
            <div className="bulk-seg">
              {BULK_CODES.map(({ code, status }) => (
                <button
                  key={code}
                  type="button"
                  className={
                    selection[record.id] === status
                      ? `bulk-dot sel-${statusKey(status)}`
                      : "bulk-dot"
                  }
                  title={status}
                  onClick={() =>
                    setSelection((prev) => ({ ...prev, [record.id]: status }))
                  }
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => onSave(selection)}
        >
          <Save className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Apply to All
        </button>
      </div>
    </Modal>
  );
};

export default BulkAttendanceModal;
