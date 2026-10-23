import { useState } from "react";
import { UserCog, X } from "lucide-react";
import type {
  StaffDept,
  StaffMember,
  StaffRoleValues,
  StaffShift,
} from "../../../types/staff";
import { DEPTS, SHIFTS } from "../../../utils/json/staffData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Assign Role — ported from #modal-role in tailwind/src/staff.html and
   openRole()/confirmRole() in assets/js/staff.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type StaffRoleModalProps = {
  staff: StaffMember | null;
  onClose: () => void;
  onConfirm: (id: number, values: StaffRoleValues) => void;
};

const StaffRoleModal = ({ staff, onClose, onConfirm }: StaffRoleModalProps) => {
  const [role, setRole] = useState(staff?.role ?? "");
  const [dept, setDept] = useState<StaffDept>(staff?.dept ?? DEPTS[0]);
  const [shift, setShift] = useState<StaffShift>(staff?.shift ?? SHIFTS[0]);

  const confirm = () => {
    if (staff) onConfirm(staff.id, { role, dept, shift });
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Assign Role</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {staff ? staff.name + " · currently " + staff.role : "Staff member"}
        </div>
        <div className="mb-3">
          <label className="f-label">Role title</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="e.g. Senior Trainer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Department</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Department"
              options={toOptions(DEPTS)}
              value={dept}
              onChange={(option) => setDept((option?.value as StaffDept) ?? DEPTS[0])}
            />
          </div>
          <div>
            <label className="f-label">Shift</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Shift"
              options={toOptions(SHIFTS)}
              value={shift}
              onChange={(option) => setShift((option?.value as StaffShift) ?? SHIFTS[0])}
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
            onClick={confirm}
          >
            <UserCog className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffRoleModal;
