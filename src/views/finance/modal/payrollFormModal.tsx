import { useState } from "react";
import { Check, X } from "lucide-react";
import type { PayrollFormValues, PayrollStatus, StaffPay } from "../../../types/payroll";
import { DEPTS, PAYROLL_STATUSES } from "../../../utils/json/payrollData";
import CommonSelect from "../../../components/common-select/commonSelect";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Payroll — ported from #modal-payroll-form in tailwind/src/payroll.html
   and openForm()/submitForm() in assets/js/payroll.js.
*/

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

type PayrollFormModalProps = {
  open: boolean;
  target: StaffPay | null;
  onClose: () => void;
  onSubmit: (values: PayrollFormValues, editId: number | null) => boolean;
};

const PayrollFormModal = ({ open, target, onClose, onSubmit }: PayrollFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [role, setRole] = useState(target?.role ?? "");
  const [dept, setDept] = useState(target?.dept ?? DEPTS[0]);
  const [status, setStatus] = useState<PayrollStatus>(target?.status ?? "Pending");
  const [basic, setBasic] = useState(target ? String(target.basic) : "");
  const [allowances, setAllowances] = useState(String(target?.allowances ?? 0));
  const [incentives, setIncentives] = useState(String(target?.incentives ?? 0));
  const [deductions, setDeductions] = useState(String(target?.deductions ?? 0));

  const submit = () => {
    const accepted = onSubmit(
      {
        name,
        role,
        dept,
        status,
        basic: Number(basic) || 0,
        allowances: Number(allowances) || 0,
        incentives: Number(incentives) || 0,
        deductions: Number(deductions) || 0,
      },
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
              {target ? "Edit Payroll" : "Add Payroll"}
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
              <label className="f-label">Employee name</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                placeholder="e.g. Daniel Foster"
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
                placeholder="e.g. Head Trainer"
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
                onChange={(option) => setDept(option?.value ?? DEPTS[0])}
              />
            </div>
            <div>
              <label className="f-label">Status</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Status"
                options={toOptions(PAYROLL_STATUSES)}
                value={status}
                onChange={(option) => setStatus((option?.value as PayrollStatus) ?? "Pending")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Basic ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                required
                value={basic}
                onChange={(e) => setBasic(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Allowances ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Incentives ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                value={incentives}
                onChange={(e) => setIncentives(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Deductions ($)</label>
              <input
                type="number"
                min="0"
                className="fp-input py-2.5 text-sm"
                placeholder="0"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
              />
            </div>
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
              {target ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollFormModal;
