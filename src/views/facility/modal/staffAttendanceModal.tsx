import { Plane, UserCheck, X } from "lucide-react";
import type { StaffMember, StaffStatus } from "../../../types/staff";
import { WEEK } from "../../../utils/json/staffData";
import { ATTENDANCE_GLYPH } from "../staffIcons";
import { attendanceWeek } from "../useStaff";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Attendance — ported from #modal-attendance in tailwind/src/staff.html and
   openAttendance()/markAttendance() in assets/js/staff.js.
*/

type StaffAttendanceModalProps = {
  staff: StaffMember | null;
  onClose: () => void;
  onMark: (id: number, status: StaffStatus) => void;
};

const StaffAttendanceModal = ({ staff, onClose, onMark }: StaffAttendanceModalProps) => {
  const pattern = staff ? attendanceWeek(staff) : [];
  const present = pattern.filter((p) => p === "present").length;
  const leave = pattern.filter((p) => p === "leave").length;

  const mark = (status: StaffStatus) => {
    if (staff) onMark(staff.id, status);
    onClose();
  };

  return (
    <div
      className={staff ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!staff}
    >
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              Attendance · <span>{staff?.name ?? "Staff"}</span>
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="att-week mb-3">
          {WEEK.map((d, i) => {
            const mark = pattern[i] ?? "off";
            const Glyph = ATTENDANCE_GLYPH[mark];
            return (
              <div key={d} className={`att-day ${mark}`}>
                <div className="d">{d}</div>
                <div className="m">
                  <Glyph
                    style={{ width: "12px", height: "12px" }}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs c-dim mb-5 text-center">
          {staff
            ? present +
              " present · " +
              leave +
              " leave · " +
              (7 - present - leave) +
              " off this week"
            : "—"}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => mark("Leave")}
          >
            <Plane className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Mark Leave
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => mark("Present")}
          >
            <UserCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Mark Present
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendanceModal;
