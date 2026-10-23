import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { AttendanceRecord, AttendanceStatus } from "../../../types/attendance";
import {
  ATTENDANCE_STATUS_OPTIONS,
  statusKey,
} from "../../../utils/json/attendanceData";

/*
   Mark Attendance — ported from #modal-mark in tailwind/src/attendance.html
   and openMark()/syncMarkPills()/markSave() in assets/js/attendance.js.
*/

type MarkAttendanceModalProps = {
  open: boolean;
  records: AttendanceRecord[];
  onClose: () => void;
  onMark: (id: string, status: AttendanceStatus, timeHH: string) => void;
};

const MarkAttendanceModal = ({
  open,
  records,
  onClose,
  onMark,
}: MarkAttendanceModalProps) => {
  const [memberId, setMemberId] = useState(records[0]?.id ?? "");
  const [status, setStatus] = useState<AttendanceStatus>("Present");
  const [time, setTime] = useState("");

  const memberOptions = records.map((record) => ({
    value: record.id,
    label: `${record.name} · ${record.id}`,
  }));

  const save = () => {
    if (!memberId) return;
    onMark(memberId, status, time);
    setTime("");
    setStatus("Present");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mark Attendance"
      boxClassName="glass modal-w-420"
    >
      <div className="space-y-4">
        <div>
          <label className="field-label">Member</label>
          <CommonSelect
            fieldClassName="py-2 text-sm"
            ariaLabel="Member"
            options={memberOptions}
            value={memberId}
            onChange={(option) => setMemberId(option?.value ?? "")}
          />
        </div>
        <div>
          <label className="field-label">Status</label>
          <div className="stat-seg">
            {ATTENDANCE_STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  option === status ? `stat-pill on-${statusKey(option)}` : "stat-pill"
                }
                onClick={() => setStatus(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Check-In Time</label>
          <input
            type="time"
            className="fp-input py-2 text-sm"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={save}
        >
          <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Mark
        </button>
      </div>
    </Modal>
  );
};

export default MarkAttendanceModal;
