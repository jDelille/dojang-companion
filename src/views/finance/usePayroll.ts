import { useCallback, useMemo, useState } from "react";
import type {
  PayrollFormValues,
  StaffPay,
  Withholding,
} from "../../types/payroll";
import { STAFF, WH_TOTAL, WITHHOLDING } from "../../utils/json/payrollData";
import { moneyWhole, usd } from "../../utils/formatUtils";
import useToast from "../../hooks/useToast";

/*
   Payroll state — ported from tailwind/src/assets/js/payroll.js. Owns the status
   tab, department filter and search, and derives the KPIs, the run banner and
   the filtered salary table.
*/

export const grossOf = (e: StaffPay) => e.basic + e.allowances + e.incentives;

export const netOf = (e: StaffPay) => grossOf(e) - e.deductions;

/*
   Splits the deduction total across the five withholding lines. The last line
   absorbs the rounding remainder so the parts always re-sum to `deductions`.
*/
export const withholdingOf = (e: StaffPay): Withholding => {
  const out = {} as Withholding;
  let used = 0;
  WITHHOLDING.forEach((w, i) => {
    const value =
      i === WITHHOLDING.length - 1
        ? e.deductions - used
        : Math.round(e.deductions * (w.rate / WH_TOTAL));
    out[w.key] = value;
    used += value;
  });
  return out;
};

export function usePayroll() {
  const { message, visible, showToast } = useToast();

  const [staff, setStaff] = useState<StaffPay[]>(STAFF);
  const [tab, setTab] = useState("All");
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");

  const find = useCallback((id: number) => staff.find((e) => e.id === id) ?? null, [staff]);

  const kpis = useMemo(() => {
    const pending = staff.filter((e) => e.status === "Pending").length;
    return {
      employees: staff.length,
      gross: usd(staff.reduce((s, e) => s + grossOf(e), 0)),
      paid: staff.filter((e) => e.status === "Paid").length,
      pending,
      /** Run banner: total net payable and the pending summary. */
      runNet: usd(staff.reduce((s, e) => s + netOf(e), 0)),
      runStatus: pending === 0 ? "All processed ✓" : pending + " pending",
      runColor: pending === 0 ? "#4ADE80" : "#FB923C",
    };
  }, [staff]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((e) => {
      const mq = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
      const mt = tab === "All" || e.status === tab;
      const md = dept === "All" || e.dept === dept;
      return mq && mt && md;
    });
  }, [staff, tab, dept, search]);

  const filteredNet = useMemo(
    () => moneyWhole(filtered.reduce((s, e) => s + netOf(e), 0)),
    [filtered],
  );

  /* ---------- Mutations ---------- */

  const saveStaff = useCallback(
    (values: PayrollFormValues, editId: number | null) => {
      const name = values.name.trim();
      if (!name) {
        showToast("Enter an employee name");
        return false;
      }

      const data = {
        name,
        role: values.role.trim() || "Staff",
        dept: values.dept,
        basic: Number(values.basic) || 0,
        allowances: Number(values.allowances) || 0,
        incentives: Number(values.incentives) || 0,
        deductions: Number(values.deductions) || 0,
        status: values.status,
      };

      if (editId != null) {
        setStaff((prev) => prev.map((e) => (e.id === editId ? { ...e, ...data } : e)));
        showToast('"' + name + '" updated');
      } else {
        setStaff((prev) => [
          { ...data, id: prev.reduce((max, e) => Math.max(max, e.id), 0) + 1 },
          ...prev,
        ]);
        showToast('"' + name + '" added to payroll');
      }
      return true;
    },
    [showToast],
  );

  const processSalary = useCallback(
    (id: number) => {
      const e = find(id);
      setStaff((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Paid" as const } : x)),
      );
      if (e) showToast("Salary processed for " + e.name);
    },
    [find, showToast],
  );

  const recordPayment = useCallback(
    (id: number, amount: number, method: string) => {
      const e = find(id);
      if (!e) return false;
      const value = Math.max(0, Number(amount) || 0);
      if (value <= 0) {
        showToast("Enter a payment amount");
        return false;
      }
      setStaff((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Paid" as const } : x)),
      );
      showToast(moneyWhole(value) + " paid to " + e.name + " via " + method);
      return true;
    },
    [find, showToast],
  );

  const deleteStaff = useCallback(
    (id: number) => {
      const e = find(id);
      setStaff((prev) => prev.filter((x) => x.id !== id));
      showToast('"' + (e?.name ?? "Employee") + '" removed from payroll');
    },
    [find, showToast],
  );

  /** Marks every pending employee paid in one pass. */
  const runAll = useCallback(() => {
    const pending = staff.filter((e) => e.status === "Pending").length;
    if (!pending) {
      showToast("Payroll already processed");
      return;
    }
    setStaff((prev) =>
      prev.map((e) => (e.status === "Pending" ? { ...e, status: "Paid" as const } : e)),
    );
    showToast("Payroll processed for " + pending + " employees");
  }, [staff, showToast]);

  const exportPayroll = useCallback(() => showToast("Payroll exported"), [showToast]);

  const downloadSlip = useCallback(() => showToast("Payslip downloaded"), [showToast]);

  return {
    staff,
    filtered,
    filteredNet,
    kpis,
    tab,
    setTab,
    dept,
    setDept,
    search,
    setSearch,
    find,
    saveStaff,
    processSalary,
    recordPayment,
    deleteStaff,
    runAll,
    exportPayroll,
    downloadSlip,
    toast: { message, visible },
  };
}

export default usePayroll;
