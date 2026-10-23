import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import type { StaffMember } from "../../../types/staff";
import { all_routes } from "../../../routes/all_routes";
import { inr } from "../useStaff";

/*
   Payroll · July 2026 — ported from #modal-payroll in tailwind/src/staff.html
   and openPayroll() in assets/js/staff.js. Withholding is federal 12% + SS
   6.2% + Medicare 1.45% + 401(k) 4%; TX has no state income tax.
*/

type StaffPayrollModalProps = {
  staff: StaffMember | null;
  onClose: () => void;
  onPayNow: (id: number) => void;
};

const StaffPayrollModal = ({ staff, onClose, onPayNow }: StaffPayrollModalProps) => {
  const salary = staff?.salary ?? 0;
  const bonus = Math.round(salary * 0.22);
  const gross = salary + bonus;
  const withheld = Math.round(gross * 0.2365);

  const payNow = () => {
    if (staff) onPayNow(staff.id);
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
          <h3 className="text-base font-black c-text">Payroll · July 2026</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="gold-border-card p-4 mb-4">
          <div className="mb-2">
            <div className="text-sm font-black c-text">{staff?.name ?? "Staff"}</div>
            <div className="text-[11px] c-dim">
              {staff ? staff.role + " · " + staff.dept : "Role · Dept"}
            </div>
          </div>
          <div className="pt-2">
            <div className="slip-row">
              <span className="c-dim">Base Pay</span>
              <span className="c-text2 font-semibold">{inr(salary)}</span>
            </div>
            <div className="slip-row">
              <span className="c-dim">Bonus &amp; Incentives</span>
              <span className="c-green font-semibold">{"+" + inr(bonus)}</span>
            </div>
            <div className="slip-row slip-line">
              <span className="c-dim">Taxes &amp; 401(k)</span>
              <span className="c-red font-semibold">{"−" + inr(withheld)}</span>
            </div>
            <div className="slip-row slip-line pt-2">
              <span className="font-black c-text">Net Pay</span>
              <span className="text-lg font-black gt">{inr(gross - withheld)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={all_routes.payroll}
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Open Payroll
          </Link>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={payNow}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Process Salary
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPayrollModal;
