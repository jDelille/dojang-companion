import { useState } from "react";
import { X } from "lucide-react";
import type { StaffPay } from "../../../types/payroll";
import { PAYROLL_METHODS } from "../../../utils/json/payrollData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { netOf } from "../usePayroll";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Record Payment — ported from #modal-payment in tailwind/src/payroll.html and
   openPayment()/confirmPayment() in assets/js/payroll.js. The amount seeds from
   the employee's net pay; the reference field is collected but unused, as in
   the template.
*/

const METHOD_OPTIONS = PAYROLL_METHODS.map((value) => ({ value, label: value }));

type PayrollPaymentModalProps = {
  employee: StaffPay | null;
  onClose: () => void;
  onConfirm: (id: number, amount: number, method: string) => boolean;
};

const PayrollPaymentModal = ({ employee, onClose, onConfirm }: PayrollPaymentModalProps) => {
  const open = employee !== null;
  const [amount, setAmount] = useState(employee ? String(netOf(employee)) : "");
  const [method, setMethod] = useState(PAYROLL_METHODS[0]);
  const [reference, setReference] = useState("");

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
            <h3 className="text-base font-black c-text">Record Payment</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {employee ? `${employee.name} · ${employee.role}` : "Employee"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Amount ($)</label>
            <input
              type="number"
              min="0"
              className="fp-input py-2.5 text-sm"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Method</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Method"
              options={METHOD_OPTIONS}
              value={method}
              onChange={(option) => setMethod(option?.value ?? PAYROLL_METHODS[0])}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="f-label">Reference / UTR</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            placeholder="Transaction reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!employee) return;
              if (onConfirm(employee.id, Number(amount) || 0, method)) onClose();
            }}
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollPaymentModal;
