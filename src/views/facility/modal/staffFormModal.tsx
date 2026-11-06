import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  StaffDept,
  StaffFormValues,
  StaffMember,
  StaffShift,
} from "../../../types/staff";
import { DEPTS, SHIFTS } from "../../../utils/json/staffData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Staff — ported from #modal-staff-form in tailwind/src/staff.html
   and openForm()/submitForm() in assets/js/staff.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type StaffFormModalProps = {
  open: boolean;
  target: StaffMember | null;
  onClose: () => void;
  onSubmit: (values: StaffFormValues, editId: number | null) => boolean;
};

const StaffFormModal = ({ open, target, onClose, onSubmit }: StaffFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [role, setRole] = useState(target?.role ?? "");
  const [dept, setDept] = useState<StaffDept>(target?.dept ?? DEPTS[0]);
  const [shift, setShift] = useState<StaffShift>(target?.shift ?? SHIFTS[0]);
  const [phone, setPhone] = useState(target?.phone ?? "");
  const [email, setEmail] = useState(target && target.email !== "—" ? target.email : "");
  const [salary, setSalary] = useState(target ? String(target.salary) : "");

  const submit = () => {
    const accepted = onSubmit(
      { name, role, dept, shift, phone, email, salary },
      target?.id ?? null,
    );
    if (accepted) onClose();
  };

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
      <div className="modal-box glass modal-w-540">
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {target ? "Edit Staff Member" : "Add Staff Member"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Full Name</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Role</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="e.g. Receptionist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Phone</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="(512) 555-0142"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Email</label>
              <input
                type="email"
                className="fp-input py-2.5 text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="f-label">Monthly Salary ($)</label>
            <input
              type="number"
              min="0"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
