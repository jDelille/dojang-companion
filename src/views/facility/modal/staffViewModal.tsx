import { CalendarCheck, Pencil, Wallet, X } from "lucide-react";
import type { StaffMember } from "../../../types/staff";
import {
  PRES,
  SHIFT_TIME,
  STAFF_STATUS_BADGE,
  avatarFor,
} from "../../../utils/json/staffData";
import { initials, inr } from "../useStaff";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Staff Profile — ported from #modal-view in tailwind/src/staff.html and
   openView() in assets/js/staff.js.
*/

type StaffViewModalProps = {
  staff: StaffMember | null;
  onClose: () => void;
  onAttendance: () => void;
  onPayroll: () => void;
  onEdit: () => void;
};

const StaffViewModal = ({
  staff,
  onClose,
  onAttendance,
  onPayroll,
  onEdit,
}: StaffViewModalProps) => (
  <div
    className={staff ? "modal-overlay open" : "modal-overlay"}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="dialog"
    aria-modal="true"
    aria-hidden={!staff}
  >
    <div className="modal-box glass modal-w-460">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <DialogEyebrow />
          <h3 className="text-base font-black c-text">Staff Profile</h3>
        </div>
        <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
        <div className={`staff-av av ${staff ? avatarFor(staff.id) : "av-gold"}`}>
          {staff ? initials(staff.name) : "--"}
          {staff && <span className="pres-dot" style={{ background: PRES[staff.status] }} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black c-text truncate">{staff?.name ?? "Staff"}</div>
          <div className="text-[11px] c-gold font-semibold">{staff?.role ?? "Role"}</div>
        </div>
        <span
          className={`badge ${staff ? STAFF_STATUS_BADGE[staff.status] : "badge-present"}`}
        >
          <span className="dot" />
          {staff?.status ?? "Present"}
        </span>
      </div>
      <div className="mb-5">
        <div className="detail-row">
          <span className="k">Department</span>
          <span className="v">{staff?.dept ?? "—"}</span>
        </div>
        <div className="detail-row">
          <span className="k">Shift</span>
          <span className="v">
            {staff ? staff.shift + " · " + SHIFT_TIME[staff.shift] : "—"}
          </span>
        </div>
        <div className="detail-row">
          <span className="k">Phone</span>
          <span className="v">{staff?.phone ?? "—"}</span>
        </div>
        <div className="detail-row">
          <span className="k">Email</span>
          <span className="v">{staff?.email ?? "—"}</span>
        </div>
        <div className="detail-row">
          <span className="k">Salary</span>
          <span className="v gt">{staff ? inr(staff.salary) + " / mo" : "—"}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onAttendance}
        >
          <CalendarCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Attendance
        </button>
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onPayroll}
        >
          <Wallet className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Payroll
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={onEdit}
        >
          <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Edit
        </button>
      </div>
    </div>
  </div>
);

export default StaffViewModal;
