import { FileText, Pencil, X, Zap } from "lucide-react";
import type { StaffPay } from "../../../types/payroll";
import { PAYROLL_STATUS_BADGE } from "../../../utils/json/payrollData";
import { avatarFor, initials, moneyWhole } from "../../../utils/formatUtils";
import { grossOf, netOf } from "../usePayroll";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Payroll Details — ported from #modal-view in tailwind/src/payroll.html and
   openView() in assets/js/payroll.js. The Process button is hidden once the
   employee is already Paid.
*/

type PayrollViewModalProps = {
  employee: StaffPay | null;
  onClose: () => void;
  onSlip: () => void;
  onProcess: () => void;
  onEdit: () => void;
};

const PayrollViewModal = ({
  employee,
  onClose,
  onSlip,
  onProcess,
  onEdit,
}: PayrollViewModalProps) => {
  const open = employee !== null;

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Payroll Details</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
          <div
            className={`emp-avatar av ${employee ? avatarFor(employee.name) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
          >
            {employee ? initials(employee.name) : "--"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black c-text truncate">
              {employee?.name ?? "Employee"}
            </div>
            <div className="text-[11px] c-dim">
              {employee ? `${employee.role} · ${employee.dept}` : "Role · Dept"}
            </div>
          </div>
          <span
            className={`badge ${employee ? PAYROLL_STATUS_BADGE[employee.status] : "badge-present"}`}
          >
            <span className="dot" />
            {employee?.status ?? "Paid"}
          </span>
        </div>
        <div className="mb-5">
          <div className="detail-row">
            <span className="k">Basic salary</span>
            <span className="v">{employee ? moneyWhole(employee.basic) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Allowances</span>
            <span className="v c-green">
              {employee ? moneyWhole(employee.allowances) : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Incentives</span>
            <span className="v c-green">
              {employee ? moneyWhole(employee.incentives) : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Gross pay</span>
            <span className="v">{employee ? moneyWhole(grossOf(employee)) : "—"}</span>
          </div>
          <div className="detail-row">
            <span className="k">Deductions</span>
            <span className="v c-red">
              {employee ? "−" + moneyWhole(employee.deductions) : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="k">Net pay</span>
            <span className="v gt">{employee ? moneyWhole(netOf(employee)) : "—"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onSlip}
          >
            <FileText className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Payslip
          </button>
          <button
            type="button"
            className={`btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2${employee?.status === "Paid" ? " hidden" : ""}`}
            onClick={onProcess}
          >
            <Zap className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Process
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
};

export default PayrollViewModal;
