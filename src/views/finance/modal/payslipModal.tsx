import { Download, X } from "lucide-react";
import type { StaffPay } from "../../../types/payroll";
import { PAYROLL_STATUS_BADGE } from "../../../utils/json/payrollData";
import { avatarFor, initials, moneyWhole } from "../../../utils/formatUtils";
import { grossOf, netOf, withholdingOf } from "../usePayroll";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Payslip — ported from #modal-slip in tailwind/src/payroll.html and openSlip()
   in assets/js/payroll.js. The five withholding lines are apportioned from the
   employee's deduction total, so they always re-sum to it.
*/

type PayslipModalProps = {
  employee: StaffPay | null;
  onClose: () => void;
  onDownload: () => void;
};

const PayslipModal = ({ employee, onClose, onDownload }: PayslipModalProps) => {
  const open = employee !== null;
  const w = employee
    ? withholdingOf(employee)
    : { federal: 0, state: 0, ss: 0, medicare: 0, "401k": 0 };

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
            <h3 className="text-base font-black c-text">Payslip · July 2026</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`emp-avatar av ${employee ? avatarFor(employee.name) : "av-gold"} w-12! h-12! text-sm! rounded-xl`}
            >
              {employee ? initials(employee.name) : "--"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-black c-text">{employee?.name ?? "—"}</div>
              <div className="text-[11px] c-dim">
                {employee ? `${employee.role} · ${employee.dept}` : "—"}
              </div>
            </div>
            <span
              className={`badge ${employee ? PAYROLL_STATUS_BADGE[employee.status] : "badge-present"}`}
            >
              <span className="dot" />
              {employee?.status ?? "Paid"}
            </span>
          </div>
          <div className="pt-2">
            <div className="slip-row">
              <span className="c-dim">Gross Pay</span>
              <span className="c-text2 font-semibold">
                {employee ? moneyWhole(grossOf(employee)) : "$0"}
              </span>
            </div>
            <div className="slip-row">
              <span className="c-dim">Federal Tax</span>
              <span className="c-red font-semibold">−{moneyWhole(w.federal)}</span>
            </div>
            <div className="slip-row">
              <span className="c-dim">State Tax (TX)</span>
              <span className="c-dim2 font-semibold">{moneyWhole(w.state)}</span>
            </div>
            <div className="slip-row">
              <span className="c-dim">Social Security</span>
              <span className="c-red font-semibold">−{moneyWhole(w.ss)}</span>
            </div>
            <div className="slip-row">
              <span className="c-dim">Medicare</span>
              <span className="c-red font-semibold">−{moneyWhole(w.medicare)}</span>
            </div>
            <div className="slip-row slip-line">
              <span className="c-dim">401(k)</span>
              <span className="c-red font-semibold">−{moneyWhole(w["401k"])}</span>
            </div>
            <div className="slip-row slip-line pt-2">
              <span className="font-black c-text">Net Pay</span>
              <span className="text-lg font-black gt">
                {employee ? moneyWhole(netOf(employee)) : "$0"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDownload}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
