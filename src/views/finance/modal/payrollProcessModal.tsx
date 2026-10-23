import { Zap } from "lucide-react";
import type { StaffPay } from "../../../types/payroll";
import { moneyWhole } from "../../../utils/formatUtils";
import { netOf } from "../usePayroll";

/*
   Process Salary — ported from #modal-process in tailwind/src/payroll.html and
   openProcess()/confirmProcess() in assets/js/payroll.js.
*/

type PayrollProcessModalProps = {
  employee: StaffPay | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const PayrollProcessModal = ({ employee, onClose, onConfirm }: PayrollProcessModalProps) => {
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
      <div className="modal-box glass modal-w-380">
        <div className="confirm-ic ok">
          <Zap className="w-6 h-6 c-green shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Process Salary?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Disburse{" "}
          <span className="font-semibold c-gold">
            {employee ? moneyWhole(netOf(employee)) : "$0"}
          </span>{" "}
          to{" "}
          <span className="font-semibold c-text">{employee?.name ?? "this employee"}</span> and
          mark as paid?
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!employee) return;
              onConfirm(employee.id);
              onClose();
            }}
          >
            Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessModal;
